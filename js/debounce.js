/**
 * 防抖函数
 * 
 * 原理：在触发事件后，需要在n秒后才执行，如果在n秒内重新触发了，那需要以重新触发的事件为基准，再等待n秒后执行
 * 
 * 入参
 * 1. fn：需要包裹的函数
 * 2. time：等待多少毫秒后再触发
 * 3. immediate：是否立即执行
 * 
 * 返回
 * 包裹后的函数
 * 
 * 追问
 * 1. 如何有返回值
 * 2. 如何随时取消
 */


function debounce(fn, time, immediate) {
    let timer = null;
    let canNow = immediate;

    return function (...rest) {
        let context = this;
        if (canNow) {
            fn.call(this, ...rest);
            canNow = false;
        } else {
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn.call(context, ...rest)
            }, time)
        }
    }
}


// 用法
function demo(c) {
    console.log(c)
};

let debounceFn = debounce(demo, 1000, false);


setInterval(() => {
    debounceFn(2);
}, 400)

debounceFn(2);
