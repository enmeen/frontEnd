import obj, { effect } from './reactive.js';
window.obj = obj;

/**
 * 支持条件分支 
 */
(function () {
    effect(() => {
        document.body.innerHTML = obj.ok ? obj.text : 'not'
        document.body.innerHTML = obj.text 
        document.body.innerHTML = 'not'
    })
})

    /**
     * 支持嵌套
     */
    (function () {
        effect(function effectFn1() {
            console.log('触发 effectFn1')
            effect(function effectFn2() {
                console.log('触发 effectFn2')
                temp1 = obj.bar
            })
            temp2 = obj.foo
        });
    })

    /**
     * 调度器实现
     */
    (function () {
        const jobQueue = new Set(); // 利用set的去重能力
        const p = Promise.resolve();

        let isFlushing = false;

        function flushJob() {
            if (isFlushing) return
            isFlushing = true; // 防止多次执行

            p.then(() => { // 利用微任务的原理；
                jobQueue.forEach(job => job());
            }).finally(() => { isFlushing = false; })
        }

        effect(() => {
            console.log('触发 obj.foo 1', obj.foo)
            console.log(obj.foo)
        }, {
            scheduler(fn) {
                // setTimeout(() => {

                // }, 1000)
                jobQueue.add(fn);
                flushJob();
            }
        });
    })

    /**
     * 调度器触发次数的实现原理
     */
    (function () {
        let a = [];
        a.push(1);
        Promise.resolve().then(() => { console.log(a) })
        a.push(2)
    
    })



