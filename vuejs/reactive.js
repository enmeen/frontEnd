/**
 * 物料
 * 1. bucket：存储副作用函数的桶，使用 WeakMap结构，对于副作用函数与被操作字段之间建立关联
 * 2. activeEffect：存储当前生效的副作用函数，供set方法感知并存储
 * 
 * 功能
 * 1. 条件分支：通过cleanup处理，/ 触发时需要重新new Set，不然会无限循环
 * 2. 支持嵌套：activeEffect嵌套的方式支持，使得可以恢复
 * 3. 避免递归：obj.foo++支持。在trigger触发时增加守卫。如果是重复是同一个activeEffect，则不重复执行
 * 4. 调度执行：通过在副作用函数上挂载参数，在触发执行阶段调用参数中的调度函数进行触发。让用户可以自己控制副作用函数的“触发时机”。另外“触发次数”也可控制
 */

let bucket = new WeakMap();  // WeakMap需要属性为object，这里存储的是obj，而不是obj.prop。因为会有obj1、obj2
let activeEffect = null; // 当前激活的副作用函数
const effectStack = []; // 
const data = { text: 'hello world', ok: true, bar: 'bar', foo: 1 }



export function effect(fn, options = {}) {
    const effectFn = () => {
        cleanup(effectFn);

        activeEffect = effectFn;
        effectStack.push(effectFn);

        fn();

        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1]; // 还原为上一个
    }
    effectFn.options = options; // 挂载参数，包含调度
    effectFn.deps = []; // 挂载收集effectFn的那些依赖

    if (!options.lazy) { effectFn() } // 计算属性，不会再一开始就执行
    
    return effectFn;
}

function cleanup(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        let deps = effectFn.deps[i];
        deps.delete(effectFn); // 副作用函数上一次收集依赖时需要都清空
    };
    effectFn.deps.length = 0; // effectFn.deps 挂载的数组清空
}

function track(target, key) {
    if (!activeEffect) { return } // 判断当前生效的副作用函数
    let depsMap = bucket.get(target); // 判断是obj还是obj2
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
    }

    let deps = depsMap.get(key)
    if (!deps) {
        depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
}

function trigger(target, key) {
    let depsMap = bucket.get(target);
    if (!depsMap) { return }
    let effects = depsMap.get(key);

    let effectsToRun = new Set();
    // 增加 trigger 守卫，阻止无限递归，支持obj.foo++
    effects.forEach((effect) => {
        if (effect !== activeEffect) {
            effectsToRun.add(effect);
        }
    })

    effectsToRun.forEach((effectFn) => {
        if (effectFn && effectFn.options && effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn) // 将副作用函数交给scheduler执行，scheduler由用户传入
        } else {
            effectFn();
        }
    })
}


const obj = new Proxy(data, {
    get(target, key) {
        track(target, key);
        // console.log('get', bucket)
        return target[key];
    },
    set(target, key, newVal) {
        target[key] = newVal;
        trigger(target, key)
        console.log('set', bucket)
        return target;
    }
})

export default obj