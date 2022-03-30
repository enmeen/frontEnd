/**
 * 发布订阅模式
 * 
 * 优点：
 * 1. 对象之间解耦
 * 2. 异步编程中可以更松耦合的代码编写
 * 
 * 缺点：
 * 1. 创建订阅者本身就需要消耗内存
2. 2. 当复杂度高的时候，程序难以跟踪维护（比如我自己在看到小程序直播sdk的时候）
 */

class PubSub {
	private subs;
	constructor() {
		this.subs = new Map();
	}
	/**
	 * 没存在key，则新建array，并插入
	 * 存在key的话，则插入
	 * @param key
	 * @param fn
	 */
	$on(key: string, fn: Function) {
		if (!this.subs.has(key)) {
			this.subs.set(key, new Array());
		}
		let array = this.subs.get(key);
		array.push(fn);
	}
	$off(key?: string, fn?: Function) {
		if (key) {
			let arr = this.subs.get(key);
			if (fn) {
				arr.forEach((element: Function, i: number) => {
					if (element === fn) {
						arr.splice(i, 1);
					}
				});
			} else {
				this.subs.delete(key);
			}
		} else {
			this.subs.clear();
		}
	}
	$emit(key: string, ...args: any[]) {
		let fns = this.subs.get(key);
		for (let fn of fns) {
			fn.apply(null, ...args);
		}
	}
}

let pubsub = new PubSub();

let fn = function () {
	console.log(1);
};

pubsub.$on("test", fn);

pubsub.$emit("test");

pubsub.$off("test", fn);
