/**
 * 单例模式
 *  
 * 何时使用：
 * 当您想控制实例数目，节省系统资源的时候
 * 
 * js单线程在实现单例模式会比较简单，无需考虑多线程下的问题
 */

class Singleton {
	static instance: Singleton;
	constructor() {
		if (Singleton.instance) {
			return Singleton.instance;
		} else {
			Singleton.instance = this;
		}
	}
}

let a = new Singleton();
let b = new Singleton();
console.log(a === b);
