/**
 * 简单工厂模式，又称静态方法模式
 * 
 * 何时使用：
 * 系统的产品有多于一个的产品族，而系统只消费其中某一族的产品。
 * 
 * 总结：
 * 1. 简单工厂模式，没有使用继承，用一个具体的类、具体（静态）的方法、来实现的。如同名字一样，适合简单的场景
 * 2. 对于下面案例中的产品，不是必须要用抽象类，只是使用抽象类生产的产品，会更可控
 * 
 * 优点：
 * 1. 封装，创建的职责封装到简单工厂中，实现对责任的分割
 * 缺点：
 * 1. 扩展困难，无法使用继承
 */

// 抽象产品
abstract class Product {}

// 具体产品A
class ConcreteProductA extends Product {}

// 具体产品B
class ConcreteProductB extends Product {}

// 简单工厂-具体的类形式
class Factory {
	create(type) {
		let product;
		switch (type) {
			case "A":
				product = new ConcreteProductA();
			case "B":
				product = new ConcreteProductB();
		}
		return product;
	}
}

// 简单工厂-静态方法形式
class Main {
	// other code
	static create(type) {
		let product;
		switch (type) {
			case "A":
				product = new ConcreteProductA();
			case "B":
				product = new ConcreteProductB();
		}
		return product;
	}
}

let factory = new Factory();
console.log(factory.create("A"));
