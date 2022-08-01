/**
 * promise 的练习
 * 首先实现最基本的
 */



const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    constructor(execute) {
        this.onFulfilled = null;
        this.state = PENDING;
        this.value = null;
        this.error = null;
        execute(this.resolve, this.reject);
    }
    // 需要箭头函数
    resolve = (value) => {
        // 记录输入的值
        if (this.state === PENDING) {
            this.value = value;
            this.state = FULFILLED;
            this.onFulfilled && this.onFulfilled(this.value)
        }
    }
    reject = (error) => {
        if (this.state === PENDING) {
            this.value = value;
            this.state = REJECTED;
        }
    }
    then = (onFulfilled, onRejected) => {
        // 收集依赖
        // 通过不同状态执行不同操作

        if (this.state === PENDING) {
            this.onFulfilled = onFulfilled;;
        } else if (this.state === FULFILLED) {
            onFulfilled(this.value);
        } else if (this.state === REJECTED) {
            onRejected(this.error);
        }
    }
}

let promise = new MyPromise((resolve, reject) => {
    console.log('promise')
    resolve('promise success');
})

promise.then((value) => {
    console.log(value);
})


let asyncFn = new MyPromise((resolve, reject) => {
    console.log('asyncFn')
    setTimeout(() => {
        resolve('asyncFn success');
    }, 1000)
})

asyncFn.then((value) => {
    console.log(value);
})