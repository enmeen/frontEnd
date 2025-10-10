// 简易版Vue3响应式系统

// 全局变量跟踪当前正在执行的effect
let activeEffect = null;

// 存储所有响应式对象的依赖关系
const targetMap = new WeakMap();

// 创建响应式对象
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

            // 追踪依赖
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

// 追踪依赖
function track(target, key) {
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

    // 添加当前effect作为依赖
    dep.add(activeEffect);
}

// 触发更新
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;

    const dep = depsMap.get(key);
    if (!dep) return;

    // 执行所有依赖此属性的effect
    dep.forEach(effect => {
        effect();
    });
}

// 注册副作用函数
function effect(fn) {
    const effectFn = () => {
        activeEffect = effectFn;
        fn();
        activeEffect = null;
    };

    // 立即执行一次以收集依赖
    effectFn();

    return effectFn;
}

// 创建ref
function ref(value) {
    const refObject = {
        _value: value,

        get value() {
            track(refObject, 'value');
            return this._value;
        },

        set value(newValue) {
            if (this._value !== newValue) {
                this._value = newValue;
                trigger(refObject, 'value');
            }
        }
    };

    return refObject;
}

// 简单的computed
function computed(getter) {
    const result = ref(null);

    effect(() => {
        result.value = getter();
    });

    return result;
}

// 使用示例
const user = reactive({ name: '张三', age: 30 });

effect(() => {
    console.log(`用户名: ${user.name}, 年龄: ${user.age}`);
});

// 修改属性会自动触发effect重新执行
user.name = '李四';  // 输出: 用户名: 李四, 年龄: 30

const counter = ref(0);
effect(() => {
    console.log(`计数: ${counter.value}`);
});
counter.value++;  // 输出: 计数: 1

const doubleCount = computed(() => counter.value * 2);
effect(() => {
    console.log(`双倍计数: ${doubleCount.value}`);
});
counter.value++;  // 会同时触发两个effect: 计数: 2 和 双倍计数: 4