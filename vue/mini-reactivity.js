/* eslint-disable no-console */
// 简易版Vue3响应式系统

// 全局变量跟踪当前正在执行的effect
let activeEffect = null;
// effect栈，用于支持effect嵌套
const effectStack = [];
// 存储所有响应式对象的依赖关系
// WeakMap结构: target -> Map(key -> Set(effects))
const targetMap = new WeakMap();

/**
 * 创建响应式对象
 * 使用Proxy拦截对象的get/set操作，实现依赖收集和触发更新
 */
function reactive(target) {
    // 只处理对象类型
    if (typeof target !== 'object' || target === null) {
        return target;
    }

    // 创建代理
    const proxy = new Proxy(target, {
        // 拦截属性读取
        get(target, key, receiver) {
            const value = Reflect.get(target, key, receiver);

            // 追踪依赖 - 在属性被访问时收集当前的effect
            track(target, key);

            // 递归使深层属性也是响应式的
            return typeof value === 'object' && value !== null
                ? reactive(value)
                : value;
        },

        // 拦截属性设置
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);

            // 值变化时触发更新
            if (oldValue !== value) {
                trigger(target, key);
            }

            return result;
        }
    });

    return proxy;
}

/**
 * 追踪依赖 - 建立属性与effect之间的双向关系
 * @param {Object} target 目标对象
 * @param {string|symbol} key 属性键
 */
function track(target, key) {
    // 如果没有活跃的effect，则不需要收集依赖
    if (!activeEffect) return;

    // 获取该对象的依赖Map
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }

    // 获取该属性的依赖集合
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set()));
    }

    // 建立双向关系
    // 1. 将当前effect添加到属性的依赖集合中
    dep.add(activeEffect);
    
    // 2. 将当前属性添加到effect的依赖列表中（用于cleanup）
    activeEffect.deps.push(dep);
}

/**
 * 触发更新 - 执行所有依赖该属性的effect
 * @param {Object} target 目标对象
 * @param {string|symbol} key 属性键
 */
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;

    const dep = depsMap.get(key);
    if (!dep) return;

    // 创建新的Set来避免在遍历过程中修改原Set导致的问题
    const effectsToRun = new Set(dep);
    
    // 执行所有依赖此属性的effect
    effectsToRun.forEach(effect => {
        // 如果当前正在执行的effect就是要触发的effect，则跳过（避免无限递归）
        if (effect !== activeEffect) {
            // 如果effect有调度器，使用调度器执行
            if (effect.scheduler) {
                effect.scheduler();
            } else {
                effect();
            }
        }
    });
}

/**
 * 清理effect的所有依赖关系
 * 用于分支切换时清理旧的依赖，避免内存泄漏
 * @param {Function} effectFn effect函数
 */
function cleanup(effectFn) {
    // 遍历effect的所有依赖
    for (let i = 0; i < effectFn.deps.length; i++) {
        const dep = effectFn.deps[i];
        // 从依赖集合中移除当前effect
        dep.delete(effectFn);
    }
    // 清空effect的依赖列表
    effectFn.deps.length = 0;
}

/**
 * 注册副作用函数
 * 支持分支切换、依赖清理和effect嵌套
 * @param {Function} fn 副作用函数
 * @param {Object} options 选项
 * @returns {Function} 返回effect函数，可用于手动触发或停止
 */
function effect(fn, options = {}) {
    const effectFn = () => {
        // 在执行前清理之前的依赖关系（关键：解决分支切换问题）
        cleanup(effectFn);
        
        // 将当前effect推入栈顶（支持嵌套）
        effectStack.push(effectFn);
        activeEffect = effectFn;
        
        try {
            // 执行副作用函数，期间会重新收集依赖
            return fn();
        } finally {
            // 执行完毕后从栈顶弹出当前effect
            effectStack.pop();
            // 恢复上一层的activeEffect（如果存在）
            activeEffect = effectStack[effectStack.length - 1] || null;
        }
    };

    // 初始化effect的依赖列表
    effectFn.deps = [];
    
    // 添加停止函数，用于手动清理effect
    effectFn.stop = () => {
        cleanup(effectFn);
    };
    
    // 支持调度器选项（用于控制effect的执行时机）
    if (options.scheduler) {
        effectFn.scheduler = options.scheduler;
    }

    // 如果不是懒执行，立即执行一次以收集依赖
    if (!options.lazy) {
        effectFn();
    }

    return effectFn;
}

/**
 * 创建ref响应式引用
 * @param {any} value 初始值
 * @returns {Object} ref对象
 */
function ref(value) {
    const refObject = {
        _value: value,

        get value() {
            // 收集依赖
            track(refObject, 'value');
            return this._value;
        },

        set value(newValue) {
            if (this._value !== newValue) {
                this._value = newValue;
                // 触发更新
                trigger(refObject, 'value');
            }
        }
    };

    return refObject;
}

/**
 * 创建计算属性
 * 具有缓存能力，只有依赖变化时才重新计算
 * @param {Function} getter 计算函数
 * @returns {Object} computed ref对象
 */
function computed(getter) {
    let value;
    let dirty = true; // 脏标记，用于缓存

    // 创建懒执行的effect
    const effectFn = effect(getter, {
        lazy: true,
        // 调度器：当依赖变化时，只标记为dirty，不立即重新计算
        scheduler() {
            if (!dirty) {
                dirty = true;
                // 触发computed的依赖更新
                trigger(obj, 'value');
            }
        }
    });

    const obj = {
        get value() {
            // 只有在dirty时才重新计算
            if (dirty) {
                value = effectFn();
                dirty = false;
            }
            // 收集computed的依赖
            track(obj, 'value');
            return value;
        }
    };

    return obj;
}

// ==================== Watch 功能实现 ====================

/**
 * 判断是否为ref对象
 * @param {any} value 要检测的值
 * @returns {boolean} 是否为ref
 */
function isRef(value) {
    return !!(value && typeof value === 'object' && '_value' in value);
}

/**
 * 深度克隆对象（简化版）
 * 用于深度监听时保存旧值的快照
 * @param {any} obj 要克隆的对象
 * @returns {any} 克隆后的对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(deepClone);
    
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

/**
 * 遍历对象的所有属性
 * 用于深度监听时触发所有嵌套属性的依赖收集
 * @param {any} value 要遍历的值
 * @param {Set} seen 已访问过的对象集合，用于避免循环引用
 * @returns {any} 返回原值
 */
function traverse(value, seen = new Set()) {
    // 处理基本类型、null、undefined 或已访问过的对象
    if (value === null || typeof value !== 'object' || seen.has(value)) {
        return value;
    }
    
    // 标记为已访问，避免循环引用导致无限递归
    seen.add(value);
    
    // 递归遍历数组
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], seen);
        }
    } else {
        // 递归遍历对象的所有属性
        for (const key in value) {
            traverse(value[key], seen);
        }
    }
    
    return value;
}

/**
 * watch 函数 - 监听响应式数据的变化
 * 支持监听 ref、reactive 对象、getter 函数以及多个数据源
 * 
 * @param {any} source 监听的数据源，可以是：
 *   - ref 对象
 *   - reactive 对象
 *   - getter 函数
 *   - 包含多个数据源的数组
 * @param {Function} callback 回调函数，接收 (newValue, oldValue) 参数
 * @param {Object} options 选项配置
 * @param {boolean} options.immediate 是否立即执行回调，默认 false
 * @param {boolean} options.deep 是否深度监听对象内部变化，默认 false
 * @param {string} options.flush 回调执行时机，'sync' | 'pre' | 'post'，默认 'sync'
 * @returns {Function} 停止监听的函数
 */
function watch(source, callback, options = {}) {
    // 解构选项参数，设置默认值
    const { immediate = false, deep = false, flush = 'sync' } = options;
    
    let getter; // 用于获取监听值的函数
    let oldValue; // 存储旧值，用于对比变化
    
    // 根据 source 的类型确定对应的 getter 函数
    if (isRef(source)) {
        // 情况1：监听 ref 对象
        // 直接返回 ref.value
        getter = () => source.value;
    } else if (Array.isArray(source)) {
        // 情况2：监听多个数据源（数组形式）
        // 返回每个数据源当前值组成的数组
        getter = () => source.map(s => {
            if (isRef(s)) return s.value;
            if (typeof s === 'function') return s();
            // 对于普通对象，如果需要深度监听则遍历所有属性
            return deep ? traverse(s) : s;
        });
    } else if (typeof source === 'function') {
        // 情况3：监听 getter 函数
        // 直接使用传入的函数作为 getter
        getter = source;
    } else {
        // 情况4：监听 reactive 对象
        // 如果开启深度监听，则遍历对象所有属性以收集依赖
        getter = () => deep ? traverse(source) : source;
    }
    
    // 如果启用深度监听且 source 不是函数，包装 getter 以遍历所有属性
    if (deep && typeof source !== 'function') {
        const baseGetter = getter;
        getter = () => traverse(baseGetter());
    }
    
    /**
     * 调度器函数 - 控制回调的执行时机和逻辑
     * 当监听的数据发生变化时，会调用这个函数
     */
    const scheduler = () => {
        // 获取新值
        const newValue = effectFn();
        
        // 检查值是否真正发生了变化
        // 对于深度监听，总是执行回调（因为内部属性可能变化）
        if (newValue !== oldValue || deep || Array.isArray(newValue)) {
            // 保存当前的旧值，用于传递给回调函数
            const prevOldValue = oldValue;
            
            // 更新旧值
            // 如果是深度监听，需要克隆新值作为下次比较的旧值
            oldValue = deep ? deepClone(newValue) : newValue;
            
            // 根据 flush 选项决定回调执行时机
            if (flush === 'sync') {
                // 同步执行回调
                callback(newValue, prevOldValue);
            } else if (flush === 'post') {
                // 异步执行（在 DOM 更新后）
                Promise.resolve().then(() => callback(newValue, prevOldValue));
            } else {
                // 'pre' 或其他情况，使用 setTimeout 模拟异步
                setTimeout(() => callback(newValue, prevOldValue), 0);
            }
        }
    };
    
    // 创建懒执行的 effect，使用调度器控制执行时机
    const effectFn = effect(getter, {
        lazy: true, // 懒执行，不立即运行
        scheduler // 当依赖变化时调用调度器而不是直接执行 effect
    });
    
    // 初始化旧值 - 执行一次 getter 获取初始值
    oldValue = effectFn();
    
    // 如果启用深度监听，克隆初始值作为旧值
    if (deep) {
        oldValue = deepClone(oldValue);
    }
    
    // 如果设置了 immediate 选项，立即执行一次回调
    if (immediate) {
        callback(oldValue, undefined);
    }
    
    // 返回停止监听的函数
    // 调用此函数可以停止监听，清理相关的依赖关系
    return () => {
        effectFn.stop();
    };
}

/**
 * watchEffect 函数 - 自动追踪依赖并在依赖变化时重新执行
 * 类似于 effect，但提供了更好的 API 和控制选项
 * 
 * @param {Function} fn 要执行的函数，会自动追踪其中访问的响应式数据
 * @param {Object} options 选项配置
 * @param {string} options.flush 执行时机，'sync' | 'pre' | 'post'，默认 'sync'
 * @param {Function} options.onTrack 依赖收集时的回调（调试用）
 * @param {Function} options.onTrigger 依赖触发时的回调（调试用）
 * @returns {Function} 停止函数
 */
function watchEffect(fn, options = {}) {
    const { flush = 'sync', onTrack, onTrigger } = options;
    
    let effectFn;
    
    // 根据 flush 选项创建不同的调度器
    const scheduler = flush === 'sync' 
        ? undefined // 同步执行，不需要调度器
        : flush === 'post'
        ? () => Promise.resolve().then(fn) // 异步执行（在 DOM 更新后）
        : () => setTimeout(fn, 0); // 其他情况使用 setTimeout
    
    // 创建 effect
    effectFn = effect(fn, {
        scheduler,
        // 调试回调（可选）
        onTrack: onTrack ? (event) => onTrack(event) : undefined,
        onTrigger: onTrigger ? (event) => onTrigger(event) : undefined
    });
    
    // 返回停止函数
    return () => {
        effectFn.stop();
    };
}

// ==================== 使用示例 ====================

// console.log('=== 基础响应式示例 ===');
// const user = reactive({ name: '张三', age: 30 });

// const userEffect = effect(() => {
//     console.log(`用户名: ${user.name}, 年龄: ${user.age}`);
// });

// // 修改属性会自动触发effect重新执行
// user.name = '李四';  // 输出: 用户名: 李四, 年龄: 30

// console.log('\n=== ref示例 ===');
// const counter = ref(0);
// const counterEffect = effect(() => {
//     console.log(`计数: ${counter.value}`);
// });
// counter.value++;  // 输出: 计数: 1

// console.log('\n=== computed示例 ===');
// const doubleCount = computed(() => counter.value * 2);
// const doubleEffect = effect(() => {
//     console.log(`双倍计数: ${doubleCount.value}`);
// });
// counter.value++;  // 会同时触发两个effect: 计数: 2 和 双倍计数: 4

// console.log('\n=== 分支切换示例 ===');
// const flag = ref(true);
// const a = ref(1);
// const b = ref(2);

// const branchEffect = effect(() => {
//     console.log('分支切换:', flag.value ? a.value : b.value);
// });

// console.log('修改a的值:');
// a.value = 10; // 会触发effect，因为当前flag为true，依赖a

// console.log('切换分支:');
// flag.value = false; // 切换到b分支

// console.log('修改a的值（应该不会触发effect）:');
// a.value = 20; // 不会触发effect，因为现在不依赖a了

// console.log('修改b的值:');
// b.value = 30; // 会触发effect，因为现在依赖b

// console.log('\n=== cleanup示例 ===');
// console.log('停止counterEffect:');
// counterEffect.stop(); // 手动停止effect

// console.log('修改counter（应该不会触发已停止的effect）:');
// counter.value++; // 不会触发counterEffect，但会触发doubleEffect

// console.log('\n=== effect嵌套示例 ===');
// const outer = ref(1);
// const inner = ref(2);
// const nested = ref(3);

// console.log('创建嵌套effect:');
// const outerEffect = effect(() => {
//     console.log(`外层effect - outer: ${outer.value}`);
    
//     // 内层effect
//     effect(() => {
//         console.log(`  内层effect - inner: ${inner.value}, nested: ${nested.value}`);
//     });
    
//     console.log(`外层effect继续执行 - outer: ${outer.value}`);
// });

// console.log('\n修改inner值（应该只触发内层effect）:');
// inner.value = 20; // 只触发内层effect

// console.log('\n修改outer值（应该触发外层effect，同时重新创建内层effect）:');
// outer.value = 10; // 触发外层effect，会重新执行整个外层effect，包括重新创建内层effect

// console.log('\n修改nested值（应该触发内层effect）:');
// nested.value = 30; // 触发内层effect

// console.log('\n=== 复杂嵌套示例 ===');
// const level1 = ref('L1');
// const level2 = ref('L2');
// const level3 = ref('L3');

// console.log('创建三层嵌套effect:');
// effect(() => {
//     console.log(`Level 1: ${level1.value}`);
    
//     effect(() => {
//         console.log(`  Level 2: ${level2.value}`);
        
//         effect(() => {
//             console.log(`    Level 3: ${level3.value}`);
//         });
        
//         console.log(`  Level 2 继续: ${level2.value}`);
//     });
    
//     console.log(`Level 1 继续: ${level1.value}`);
// });

// console.log('\n修改level3（应该只触发第三层）:');
// level3.value = 'L3-modified';

// console.log('\n修改level2（应该触发第二层和第三层）:');
// level2.value = 'L2-modified';

// console.log('\n修改level1（应该触发所有层级）:');
// level1.value = 'L1-modified';

// console.log('\n=== watch 功能演示 ===');

// // 1. 监听 ref
// console.log('--- 1. 监听 ref ---');
// const watchCounter = ref(0);

// const stopWatchRef = watch(watchCounter, (newVal, oldVal) => {
//     console.log(`watch ref - 计数变化: ${oldVal} -> ${newVal}`);
// });

// console.log('修改 watchCounter:');
// watchCounter.value = 1;
// watchCounter.value = 2;

// // 2. 监听 reactive 对象的属性
// console.log('\n--- 2. 监听 reactive 对象的属性 ---');
// const watchUser = reactive({ name: 'Alice', age: 25, profile: { city: 'Beijing' } });

// const stopWatchProp = watch(
//     () => watchUser.name, // getter 函数
//     (newVal, oldVal) => {
//         console.log(`watch getter - 用户名变化: ${oldVal} -> ${newVal}`);
//     }
// );

// console.log('修改用户名:');
// watchUser.name = 'Bob';
// watchUser.name = 'Charlie';

// // 3. 深度监听
// console.log('\n--- 3. 深度监听 reactive 对象 ---');
// const stopWatchDeep = watch(
//     watchUser,
//     (newVal, oldVal) => {
//         console.log('watch deep - 用户对象发生深度变化');
//         console.log(`当前用户: ${newVal.name}, ${newVal.age}岁, 住在${newVal.profile.city}`);
//     },
//     { deep: true }
// );

// console.log('修改嵌套属性:');
// watchUser.profile.city = 'Shanghai';
// watchUser.age = 26;

// // 4. 监听多个数据源
// console.log('\n--- 4. 监听多个数据源 ---');
// const coord_x = ref(1);
// const coord_y = ref(2);

// const stopWatchMultiple = watch(
//     [coord_x, coord_y], // 监听多个源
//     ([newX, newY], [oldX, oldY]) => {
//         console.log(`watch multiple - 坐标变化: (${oldX}, ${oldY}) -> (${newX}, ${newY})`);
//     }
// );

// console.log('修改坐标:');
// coord_x.value = 10;
// coord_y.value = 20;

// // 5. immediate 选项
// console.log('\n--- 5. immediate 选项 ---');
// const message = ref('Hello');

// const stopWatchImmediate = watch(
//     message,
//     (newVal, oldVal) => {
//         console.log(`watch immediate - 消息: ${oldVal || 'undefined'} -> ${newVal}`);
//     },
//     { immediate: true } // 立即执行
// );

// console.log('修改消息:');
// message.value = 'World';

// console.log('\n=== watchEffect 功能演示 ===');

// // 6. watchEffect 基础使用
// const effect_a = ref(1);
// const effect_b = ref(2);

// const stopWatchEffect = watchEffect(() => {
//     console.log(`watchEffect - a=${effect_a.value}, b=${effect_b.value}, sum=${effect_a.value + effect_b.value}`);
// });

// console.log('修改 effect_a 和 effect_b:');
// effect_a.value = 5;
// effect_b.value = 3;

// // 7. 条件性依赖收集
// console.log('\n--- 7. watchEffect 条件性依赖 ---');
// const shouldShow = ref(true);
// const content = ref('内容');

// const stopConditionalEffect = watchEffect(() => {
//     if (shouldShow.value) {
//         console.log(`watchEffect conditional - 显示内容: ${content.value}`);
//     } else {
//         console.log('watchEffect conditional - 隐藏内容');
//     }
// });

// console.log('修改内容（应该触发）:');
// content.value = '新内容';

// console.log('切换显示状态:');
// shouldShow.value = false;

// console.log('再次修改内容（不应该触发，因为不依赖content了）:');
// content.value = '另一个内容';

// console.log('重新显示:');
// shouldShow.value = true;

// // 8. 异步 flush 选项演示
// console.log('\n--- 8. 异步执行演示 ---');
// const asyncData = ref('初始值');

// // 同步watch
// watch(asyncData, (newVal, oldVal) => {
//     console.log(`同步 watch: ${oldVal} -> ${newVal}`);
// });

// // 异步watch
// watch(asyncData, (newVal, oldVal) => {
//     console.log(`异步 watch (post): ${oldVal} -> ${newVal}`);
// }, { flush: 'post' });

// console.log('修改 asyncData:');
// asyncData.value = '新值';
// console.log('同步代码执行完毕');

// // 9. 手动停止监听
// setTimeout(() => {
//     console.log('\n--- 9. 停止监听演示 ---');
//     console.log('停止所有 watch 和 watchEffect...');
    
//     // 停止所有监听器
//     stopWatchRef();
//     stopWatchProp();
//     stopWatchDeep();
//     stopWatchMultiple();
//     stopWatchImmediate();
//     stopWatchEffect();
//     stopConditionalEffect();
    
//     console.log('修改数据（应该不会触发任何回调）:');
//     watchCounter.value = 999;
//     watchUser.name = 'Should not trigger';
//     coord_x.value = 999;
//     effect_a.value = 999;
    
//     console.log('\nwatch 功能演示完成！');
// }, 100);


// 写一个深度响应的demo
const obj = reactive({
    a: 1,
    b: {
        c: 2
    }
})

effect(() => {
    console.log('effect',obj.b.c)
})

obj.b.c = 3
