

let activeEffect = null;
const targetMap = new WeakMap();

function reactive(target) {
    if (typeof target !== 'object' || target === null) {
        return target;
    }
    return new Proxy(target, {
        get(target, key, receiver) {
            const value = Reflect.get(target, key, receiver);
            track(target, key);

            // 递归使深层属性也是响应式的
            if (typeof value === 'object' && value !== null) {
                return reactive(value);
            }
            return value;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);

            if (oldValue !== value) {
                trigger(target, key);
            }
            return result;
        }
    })
}


function track(target, key) {

    if (!activeEffect) return;
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }

    let dep = depsMap.get(key);

    if (!dep) {
        depsMap.set(key, (dep = new Set()));
    }

    dep.add(activeEffect);
}

function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;

    const dep = depsMap.get(key);
    if (!dep) return;

    dep.forEach(effect => {
        effect();
    })
}

function effect(fn) {
    const effectFn = () => {
        activeEffect = effectFn;
        fn();
        activeEffect = null;
    }
    effectFn()

    return effectFn;
}


const user = reactive({ name: '张三', age: 30 });

effect(() => {
    console.log(`用户名: ${user.name}, 年龄: ${user.age}`);
});

// 修改属性会自动触发effect重新执行
user.name = '李四';  // 输出: 用户名: 李四, 年龄: 30