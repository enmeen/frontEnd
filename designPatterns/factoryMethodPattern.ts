/**
 * 工厂方法模式，又称工厂模式。属于创建型模式
 * 
 * 何时使用：
 * 我们明确地计划不同条件下创建不同实例时
 * 
 * 成员：
 * 1. 一个抽象产品类
 * 2. 多个具体产品类
 * 3. 一个抽象工厂类
 * 4. 多个具体工厂类 - 每一个具体产品对应一个具体工厂
 * 
 * 总结：
 * 如同模式名称一样，叫工厂方法模式，将创建的方法在子类实现。核心（抽象）类不再负责具体创建
 * 
 * 举例：
 * 一家披萨工厂，生产不同味道的披萨
 *
 * 类图：
 * https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2018/8/2/164fa6e4508d2014~tplv-t2oaga2asx-watermark.awebp
 */

// 抽象产品
abstract class Product {
	create() {}
}

// 具体产品
class ConcreteProductNS_A extends Product {
	create() {
		console.log("生产 NS_A");
	}
}

// 具体产品
class ConcreteProductNS_B extends Product {
	create() {
		console.log("生产 NS_B");
	}
}

// 具体产品
class ConcreteProductCH_A extends Product {
	create() {
		console.log("生产 CH_A");
	}
}

// 具体产品
class ConcreteProductCH_B extends Product {
	create() {
		console.log("生产 CH_B");
	}
}

abstract class Factory {
	getProduct(type: string): any {}
}

class ConcreteFactoryNS extends Factory {
	getProduct(type) {
		let product;
		switch (type) {
			case "A":
				product = new ConcreteProductNS_A();
				break;
			case "B":
				product = new ConcreteProductNS_B();
				break;
		}
		// other code for process the product
		return product;
	}
}

class ConcreteFactoryCH extends Factory {
	getProduct(type) {
		let product;
		switch (type) {
			case "A":
				product = new ConcreteProductCH_A();
				break;
			case "B":
				product = new ConcreteProductCH_B();
				break;
		}
		console.log(product);
		// other code for process the product
		return product;
	}
}

let factoryCH = new ConcreteFactoryCH();
let product = factoryCH.getProduct("A");

product.create();
