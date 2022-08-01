// 带有并发数量控制的异步调度器
class Scheduler {
    constructor(count = 2) {
        this.count = count
        this.queue = []
        this.run = []
    }

    add(task) {
        this.queue.push(task)
        return this.schedule()
    }

    schedule() {
        if (this.run.length < this.count && this.queue.length) {
            const task = this.queue.shift()
            const promise = task().then(() => {
                this.run.splice(this.run.indexOf(promise), 1)
            })
            this.run.push(promise)
            return promise
        } else {
            return Promise.race(this.run).then(() => this.schedule())
        }
    }
}



// 以下是题目
// JS实现一个带并发限制的异步调度器Scheduler，
// 保证同时运行的任务最多有两个。
// 完善代码中Scheduler类，
// 使得以下程序能正确输出

class Scheduler {
    constructor() {
        this.count = 2
        this.queue = []
        this.run = []
    }

    add(task) {
        this.queue.push(task); // 往等待队列中添加
        return this.schedule();
    }
    
    schedule() {
        if (this.run.length < this.count && this.queue.length) {
            // 如果执行队列中仍有空余则取出队列头部任务并塞入
            let task = this.queue.shift();
            let promise = task().then(() => {
                this.run.splice(this.run.indexOf(promise), 1); // 每个任务挂载，完成后自己删除的事件
            });
            this.run.push(promise);
            return promise;
        }else{
            // 已经达到并发上限了
            Promise.race(this.run).then(()=>{
                this.schedule();
            })
        }
    }
}


const timeout = (time) => new Promise(resolve => {
    setTimeout(resolve, time)
})

const scheduler = new Scheduler()
const addTask = (time, order) => {
    scheduler.add(() => timeout(time)).then(() => console.log(order))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')
// output: 2 3 1 4

// 一开始，1、2两个任务进入队列
// 500ms时，2完成，输出2，任务3进队
// 800ms时，3完成，输出3，任务4进队
// 1000ms时，1完成，输出1
// 1200ms时，4完成，输出4