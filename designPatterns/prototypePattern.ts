/**
 * 原型模式，用于“高效”的创建“重复”的对象，属于创建型模式。
 *
 * 定义：
 * 用原型实例指定创建对象的种类，并且通过拷贝这些原型创建新的对象
 *
 * 何时使用：
 * 实力例化的类在运行时指定（如实例化之前需要先从数据裤获取数据）
 *
 * 成员：
 * 1. Client：客户端
 * 2. Prototype：原型
 * 3. Clones: 克隆出来的产出
 *
 * 总结：
 *
 *
 * 举例：
 *
 *
 * 问题：
 *
 * 类图：
 *
 */

// 利用js语言的特性，可以使用 Object.create() or prototype 2种方式来实现

abstract class Prototype {
	clone() {}
}

// Object.create()方式

class OriginByCreate extends Prototype {
	data: any;
	constructor() {
		super();
		// 做一些前置操作
		this.data = { date: "来自数据库的数据" };
	}
	clone() {
		return Object.create(this.data);
	}
}

let new1 = new OriginByCreate().clone();

// prototype 方式

class OriginByPrototype extends Prototype {
	Empty: any;
	constructor() {
		super();
		// 做一些前置操作
		this.Empty = () => {};
		Object.assign(this.Empty.prototype, { date: "来自数据库的数据" });
	}
	clone() {
		return new this.Empty();
	}
}

let new2 = new OriginByPrototype().clone();

console.log(new2.date);
