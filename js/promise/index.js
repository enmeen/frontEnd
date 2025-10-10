const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
const PENDING = 'pending';

/**
 * 手写promise，考察知识点
 * 1. 函数作为入参，传给传入的函数（解析器）
 * 2. 事件循环机制（对通过then传入的回调进行封装，保障执行顺序）
 * 3. 链式调用的实现
 */

class MyPromise {
    constructor(executor) {
        this.status = PENDING;
        this.value = ''; // 存储正常返回的值存储
        this.reason = ''; // 存储错误返回的值

        this.onResolveCbs = [];
        this.onRejectCbs = [];
        // 1. 改变状态（需要判断是否是pending状态）
        // 2. 记录值
        // 3. 触发回调钩子（then时存储的）
        const resolve = (value) => {
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
                this.onResolveCbs.forEach(cb => cb(this.value))
            }

        }
        const reject = (error) => {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = error;
                this.onRejectCbs.forEach(cb => cb(this.reason))
            }
        }
        try {
            // 这一步对我不太好理解的，由于传入的是一个解释器
            executor(resolve, reject)
        } catch (e) {
            reject(e);
        }
    }
    // 1. 首先要判断传入的类型，默认可以是函数 or 值 的
    // 2. 支持链式，则必须返回一个新的同类型
    then(onResolve, onReject) {
        onResolve = typeof onResolve === 'function' ? onResolve : (x) => x;
        onReject = typeof onReject === 'function' ? onReject : (reason) => { throw reason };

        const promise2 = new MyPromise((resolve, reject) => {
            // 已经结束了，那执行传入的onResolve即可（注意要放到下个任务中）
            // 也就是说，通过then方法传进来的函数，会在内部再包裹一层，推到微任务队列中
            const handleResolve = () => {
                // 放到微队列中
                queueMicrotask(() => {
                    try {
                        const x = onResolve(this.value);
                        this.resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                })
            }

            const handleReject = () => {
                queueMicrotask(() => {
                    try {
                        const x = onReject(this.value);
                        this.resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                })
            }

            if (this.status === FULFILLED) {
                handleResolve();
            }

            if (this.status === REJECTED) {
                handleReject();
            }

            if (this.status === PENDING) {
                this.onResolveCbs.push(handleResolve);
                this.onRejectCbs.push(handleReject);
            }
        })

        return promise2;
    }
    // 1. 判断 x === promise，防止循环引用，通过reject抛出错误
    // 2. 判断 x === new Promise，判断是否是新的promise，直接调用即可
    // 3. thenable对象的调用
    resolvePromise(promise2, x, resolve, reject) {
        if (promise2 === x) {
            reject(new TypeError('存在循环引用'))
        }
        if (x instanceof MyPromise) {
            x.then(resolve, reject)
        } else if (typeof x === 'object' || typeof x === 'function') {
            if (x === null) {
                resolve(x);
            }
            let then;

            try {
                then = x.then;
            } catch (err) {
                reject(err)
            }
            if (typeof then === 'function') {
                // 返回一个thenable对象，说实话比较少见，一般用不到
                // called 用了一个闭包，防止多次执行
                let called = false;
                try {
                    then.call(x, value => {
                        if (called) return;
                        called = true;
                        this.resolvePromise(promise2, value, resolve, reject);
                    }, reason => {
                        if (called) return;
                        called = true;
                        this.resolvePromise(promise2, reason, resolve, reject);
                    })
                } catch (err) {
                    if (called) return;
                    reject(err);
                }
            } else {
                resolve(x)
            }

        } else {
            resolve(x)
        }
    }
}

// const p = new MyPromise((resolve, reject) => {
//     setTimeout(() => {
//         resolve(1);
//     }, 1000)
// });

// // 这里的then执行时，状态，执行时会存储在promise的cbs中
// p.then((val) => { console.log(val) })




// // 这里的then执行时，状态已经确定，会直接执行
// setTimeout(() => {
//     p.then((val) => { console.log(3) })
// }, 2000)

export default MyPromise
