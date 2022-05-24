import MyPromise from "./index.js";

let promise = new MyPromise((resolve, reject) => {
    resolve('promise success');
});

promise.then((value) => {
    console.log(value)
});


// 如何
let promise1 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('promise1 success')
    }, 1000)
});


promise1.then((value) => {
    console.log(1)
    console.log(value)
});


promise1.then((value) => {
    console.log(2)
    console.log(value)
}).then((value) => {
    console.log(3);
})

let promise2 = new MyPromise((resolve, reject) => {
    throw new Error('promise2 error');
    setTimeout(() => {
        reject('promise2 reject')
    }, 2000)
})

promise2.then(() => { }, () => {
    console.log('promise2 reject');
})