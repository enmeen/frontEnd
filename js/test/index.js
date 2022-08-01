// TODO 手写promise.all
/**
 * 1. return Promise<array<any>>
 * 2. can use promise.resolve
 * 3. how to control 顺序
 * @param {*} list 
 */
function promiseAll(list) {
    return new Promise((resolve, reject) => {
        let uid = 0;
        let result = []; // 返回一个array
        for (let i = 0; i < list.length; i++) {
            let curr = list[i];
            Promise.resolve(curr).then((data) => { // 向每个执行的then里面注入检查，检查是否返回
                uid++;
                result[i] = data;
                if (uid === list.length) {
                    resolve(result);
                };
            }).catch((e) => {
                reject(e);
            })
        }
    })
}


// demo
let cb1 = function () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(1);
        }, 1000)
    })
}

let cb2 = function () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(2);
        }, 2000)
    })
}

// Promise.all([cb1(), cb2()]).then((values) => {
//     console.log(values)
// });

promiseAll([cb1(), cb2()]).then((values) => {
    console.log(values);
});

// TODO promise.race
function promiseRace(list) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < list.length; i++) {
            let curr = list[i];
            Promise.resolve(curr).then((data) => {
                resolve(data);
            }).catch((e) => {
                reject(e);
            })
        }
    })
}

// TODO 性能指标有哪些
let xnzb = {
    FCP: '最初元素渲染时间',
    LCP: '页面主要内容渲染指标',
    TTI: '可响应用户时间',
    TBT: '总阻塞时长',
    SI: '可视区域加载速度',
    CLS: '累计布局偏移'
}

// TODO 实现一个flat

function flat(array) {
    let res = [];
    for (let i = 0; i < array.length; i++) {
        let curr = array[i];
        if (Array.isArray(curr)) {
            res.push(...flat(curr));
        } else {
            res.push(curr);
        }
    }
    return res;
}

let flat_demo = [[1, 2], 3, [4, [5, [6, 7]]]];
// console.log(flat(flat_demo));

// TODO flat支持参数控制拍扁层数
function flatV2(array, number) {
    let res = [];
    for (let i = 0; i < array.length; i++) {
        let curr = array[i];
        console.log(curr, number)
        if ((number > 0) && Array.isArray(curr)) {
            res.push(...flatV2(curr, number - 1)); // 秒啊，不用number--；而是number-1
        } else {
            res.push(curr);
        }
    }
    return res;
}
console.log('flatV2', flatV2(flat_demo, 1));

// TODO 节流
/**
 * 在触发后一定时间内不再触发，才触发。如果触发了，需要再等n秒
 * 定时器
 * @param {*} params 
 */
function debounce(fn, wait = 1000) {
    let timer = null;
    return function (...rest) {
        clearTimeout(timer);
        let ctx = this;
        timer = setTimeout(function () {
            fn.apply(ctx, rest);
        }, wait)
    }
}

let debounce_demo = function (param) {
    console.log('debounce_demo');
}

debounce_demo = debounce(debounce_demo);

debounce_demo();
debounce_demo();

// TODO 防抖
/**
 * 定时器or时间戳
 * @param {*} params 
 */
function throttle(fn, wait = 1000) {
    let pre = 0;
    return function (...rest) {
        let now = +new Date();
        let ctx = this;
        if (now - pre >= wait) {
            fn.apply(ctx, rest);
            pre = now;
        }
    }
}

let throttle_demo = function (param) {
    console.log('throttle_demo');
}
throttle_demo = throttle(throttle_demo, 1000);

// setInterval(()=>{
//     throttle_demo();
// })

// TODO new

function _new(constructor, ...rest) {
    let obj = {};
    Object.setPrototypeOf(obj, constructor.prototype);
    let res = constructor.apply(obj, rest);
    return typeof res === 'object' ? res : obj;
}

function Person(name) {
    this.name = name;
}

Person.prototype.walk = function () {
    console.log(`${this.name} is walking`)
}

// let new_demo = new Person('desen');
let new_demo = _new(Person, 'desen')
new_demo.walk();

// TODO instanceOf 实现

/**
 * 判断是否是原型链
 */
function new_instanceOf(obj, ctr) {
    let _obj = obj.__proto__;
    while (_obj) {
        if (_obj === ctr.prototype) {
            return true;
        }
        _obj = _obj.__proto__;
    }
    return false;
}

console.log('instanceOf', Person instanceof Object);
console.log('new_instanceOf', new_instanceOf(Person, Object));


// TODO eventBus
class EventBus {
    constructor() {
        this.bucket = new Map();
    }
    $on(key, fn) {
        let fns = this.bucket.get(key);
        if (!fns) {
            this.bucket.set(key, fns = new Set());
        }
        fns.add(fn);
    }
    $once(key, fn) { }
    $off(key, fn) {
        if (!key) {
            this.bucket.clear();
            return true;
        }
        let fns = this.bucket.get(key);
        if (!fn) {
            fns.clear();
            return true;
        }
        fns.delete(fn);
    }
    $emit(key, ...rest) {
        let fns = this.bucket.get(key);
        for (let fn of fns) {
            try {
                fn.call(null, ...rest)
            } catch (e) {
                console.log('e');
            }
        }
    }
}

// TODO curry
function curry(fn, ...rest) {
    if (fn.length < rest.length) {
        // 还没满足入参
        return function (...rest) { }
    } else {
        fn.call(null, ...rest);
    }
}

var a = {
    name: 'bill',
    show1: function () { console.log(this.name) },
    show2: () => { console.log(this.name) },
    show3: () => {
        function c() {
            console.log(this.name)
        }
        c();
    }
}

a.show1();
a.show2();
a.show3();

function* test() { }
console.log(test());

let obj = { a: 1 };

// for (let key of obj) {
//     console.log(key);
// }

new Promise(()=>{
    throw new Error();
}).catch(()=>{
    console.log(1)
}).then(()=>{
    console.log(2)
})

new Promise(()=>{
    throw new Error();
}).then(undefined, ()=>{
    console.log(3)
}).then(()=>{
    console.log(2)
})