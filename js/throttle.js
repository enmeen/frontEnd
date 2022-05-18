/**
 * 节流函数
 * 
 * 原理：当频繁触发函数时，每隔一段时间只触发一次
 * 
 * 实现方案有2种
 * 1. 时间戳
 * 2. 定时器
 * 
 * 常见场景
 * 1. 下拉加载
 * 
 * 入参
 * 1. fn
 * 2. wait
 * 
 * 出参
 * 1. 包裹后的fn
 */

// 时间戳版本
function throttle(fn, wait) {
    let stamp = 0;
    return function (...rest) {
        let newStamp = +new Date();
        let ctx = this;
        if (newStamp - stamp > wait) { // 超出一定时间
            fn.call(ctx, ...rest);
            stamp = newStamp;
        }
    }
}

function demo(params) {
    console.log(params);
}

let throttleCb = throttle(demo, 2000);

setInterval(() => {
    throttleCb(122)
}, 200)