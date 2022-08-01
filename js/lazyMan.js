// 实现一个LazyMan，可以按照以下方式调用:
// LazyMan(“Hank”)输出:
// Hi! This is Hank!

// LazyMan(“Hank”).sleep(10).eat(“dinner”)输出
// Hi! This is Hank!
// 等待10秒..
// Wake up after 10
// Eat dinner~

// LazyMan(“Hank”).eat(“dinner”).eat(“supper”)输出
// Hi This is Hank!
// Eat dinner~
// Eat supper~

// LazyMan(“Hank”).sleepFirst(5).eat(“supper”)输出
// //等待5秒
// Wake up after 5
// Hi This is Hank!
// Eat supper
// 以此类推。


function sleep(time) {
    return new Promise((resolve) => {
        console.log(`I am sleep...`)
        setTimeout(() => {
            console.log(`after ${time} s`);
            resolve();
        }, time * 1000)
    })
}

/**
 * 思路
 * 1. 链式调用：每次返回自身
 * 2. 将sleep和eat方法的函数，都存储到一个队列中。然后取出队列的头部执行，执行完后继续执行下一个
 * 
 * 考察点：
 * 1. 链式调用
 * 2. 队列
 * 3. ⭐️事件循环：为什么能够实现sleep的原因。因为触发next方法的时机是在实例化LazyMan。此时通过将触发时机推入到下个宏任务，可以保证链式调用的方法已经执行完毕
 */
class LazyMan {
    constructor(name) {
        let self = this;
        this.tasks = [];
        let task = function () {
            console.log(`Hi! this is ${name}`, self);
            self.next();
        }
        this.tasks.push(task);
        setTimeout(() => {
            this.next();
        }, 0)
        return this;
    }
    sleep(time) {
        let self = this;
        let task = async function () {
            await sleep(time);
            self.next();
        }
        this.tasks.push(task);
        return this;
    }
    eat(thing) {
        let self = this;
        let task = function () {
            console.log(`I am eat ${thing}`);
            self.next();
        }
        this.tasks.push(task);
        return this;
    }
    // 从任务队列中取出第一个执行
    next() {
        let task = this.tasks.shift();
        task && task();
    }
}
var lazyMan = new LazyMan('desen');
lazyMan.eat('apple').eat('banner').sleep(2).eat('apple');