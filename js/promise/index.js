/**
 * 自己实现的promise
 * 参考：https://juejin.cn/post/6945319439772434469#heading-21
 */
/**
 * 1. 3种状态
 * 2. 1个执行器
 * 3. then + 链式调用（then像是依赖收集器）
 * 4. 成功和失败的结果存储
 * 5. 支持异步
 * 
 * 支持异步
 * 1. resolve函数是promise内部定义的，所以当resolve函数执行时，理论上来说就是拿到结果了
 * 2. 所以我们要做的事情就是提前在then的时候保存下来，然后异步回调发生时，resolve能够拿到then注册的函数，并执行
 * 
 * 支持then多次调用
 * 1. 用数组来保存then的所有回调函数
 * 2. 在resolve执行时，遍历触发
 * 
 * 支持then链式调用
 * 1. 需要返回一个promise对象
 * 2. onFulfilled回调因为是用户传入的，所以有2种情况。1. promise对象，2. 普通值
 * 3. 利用事件循环机制，创建一个异步函数等待promise完成初始化
 * 
 * 错误捕获
 * 1. 执行器报错
 * 2. then内的报错
 * 3. catch内的报错
 * 4. 利用try...catch捕获
 */
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    state = PENDING;
    value = null;
    reason = null;
    onFulfilledCallbackList = []; // 异步调用的话，需要将回调先保存起来
    onRejectedCallbackList = [];

    constructor(executor) {
        try {
            executor(this.resolve, this.reject)
        } catch (err) {
            this.reject(err)
        }
    }
    // 在pending阶段会收集里面的回调
    // 在fulfilled阶段会直接执行
    then(onFulfilled, onRejected) {
        const promise2 = new MyPromise((resolve, reject) => {
            switch (this.state) {
                case FULFILLED:
                    try {
                        queueMicrotask(() => {
                            const x = onFulfilled(this.value); // 这里可能是promise也能是普通返回值
                            resolvePromise(promise2, x, resolve, reject);
                        });
                    } catch (err) {
                        reject(err)
                    }
                    break;
                case REJECTED:
                    onRejected(this.fail);
                    break;
                case PENDING:
                    this.onFulfilledCallbackList.push(onFulfilled);
                    this.onRejectedCallbackList.push(onRejected);
                    break;
            }
        })
        return promise2;
    }
    // 异步事件完成，触发当中的回调
    resolve = (value) => {
        if (this.state === PENDING) {
            this.state = FULFILLED;
            this.value = value;

            while (this.onFulfilledCallbackList.length) {
                let onFulfilledCallback = this.onFulfilledCallbackList.shift();
                onFulfilledCallback && onFulfilledCallback(this.value);
            }
        }
    }

    reject = (e) => {
        if (this.state === PENDING) {
            this.state = REJECTED;
            this.reason = e;

            while (this.onRejectedCallbackList.length) {
                let onRejectedCallbackList = this.onRejectedCallbackList.shift();
                onRejectedCallbackList(this.reason);
            }
        }
    }
}

function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject(new TypeError('循环引用'));
    }
    if (x instanceof MyPromise) {
        // 传入的promise对象
        x.then(resolve, reject);
    } else {
        // 普通值
        resolve(x);
    }
}

export default MyPromise;