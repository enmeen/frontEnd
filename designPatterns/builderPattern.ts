/**
 * 建造者模式，又叫生成器模式
 * 
 * 定义：
 * 将一个复杂对象的构成建与它的表示分离，使得同样的构建过程可以创建不同的表示
 *
 * 何时使用：
 * 构造一个复杂对象，对象中的一些部分根据一些算法进行变化。其中的各部分会随着需求变化发生剧烈的变化。但将他们组合在一起的算法却比较稳定。
 *
 * 成员：
 * 1. Builder建造者：创建和提供实例
 * 2. Director指挥者：管理建造出来的实例的依赖关系
 * 3. Product产品
 *
 * 总结：
 * 1. 该模式将 （复杂的）构建 和 复杂对象 进行了分离，所以归属于创建模式的一种。
 *
 * 举例：
 * 去肯德基，汉堡、可乐、薯条、炸鸡翅等是不变的，而其组合是经常变化的，生成出所谓的"套餐"
 *
 * 问题：
 * 上述汉堡套餐的例子和 “何时使用” 有歧义。案例中每个部分是固定的，但是组合是不固定的。而“何时使用”中却相反。到底怎么理解呢？
 *
 * 类图：
 * https://s10.mogucdn.com/mlcdn/c45406/211011_6lg65habea3lk8k9f7jaah8bg6112_2310x1106.jpg
 */

// 产品类
abstract class Food {
	price: number;
}
// 导演类（内部维护着最终生成的复杂对象）
abstract class Director {}
// 建造者（内部维护着构成复杂对象的组合关系）
abstract class Builder {}

class Pizza extends Food {
	constructor() {
		super();
		this.price = 10;
	}
}

class Chips extends Food {
	constructor() {
		super();
		this.price = 100;
	}
}

class Cola extends Food {
	constructor() {
		super();
		this.price = 1;
	}
}

// 套餐，即产品
class Meal {
	list: Array<Food>; // 保存着依赖关系
	constructor() {
		this.list = [];
	}
	addItem(food: Food) {
		this.list.push(food);
	}
	getCost() {
		let totalPrice = 0;
		this.list.forEach((item) => {
			totalPrice += item.price;
		});
		return totalPrice;
	}
}
/***************** error 案例/s ******************/

// 建造者，关心如何创建套餐
class MealBuilder extends Builder {
	prepareNoDrinkMeal() {
		// 较为固定的组合方法
		let meal = new Meal();
		meal.addItem(new Pizza());
		meal.addItem(new Chips());
		return meal;
	}
	prepareHasDrinkMeal() {
		let meal = new Meal();
		meal.addItem(new Pizza());
		meal.addItem(new Chips());
		meal.addItem(new Cola());
		return meal;
	}
}
let builder = new MealBuilder();
let noDrinkMeal = builder.prepareNoDrinkMeal();
let hasDrinkMeal = builder.prepareHasDrinkMeal();

console.log("noDrinkMeal", noDrinkMeal.getCost());
console.log("hasDrinkMeal", hasDrinkMeal.getCost());
/***************** error 案例/e ******************/

/**
 * why 上述的案例是有问题的
 * 1. 没有指挥者，进行组合。案例中在builder中实现了。。。
 */

/***************** correct 案例/s ******************/

/**
 * 1. 构造和装配各个部件
 */
class HasDrinkMealBuilder extends Builder {
	meal: Meal;
	constructor() {
		super();
		this.meal = new Meal();
	}
	buildFood() {
		this.meal.addItem(new Pizza());
		this.meal.addItem(new Chips());
	}
	buildDrink() {
		this.meal.addItem(new Cola());
	}
	getMeal(): Meal {
		return this.meal;
	}
}

class NoDrinkMealBuilder extends Builder {
	meal: Meal;
	constructor() {
		super();
		this.meal = new Meal();
	}
	buildFood() {
		this.meal.addItem(new Pizza());
		this.meal.addItem(new Chips());
	}
	buildDrink() {}
	getMeal(): Meal {
		return this.meal;
	}
}

/**
 * 1. 指挥者，指挥组装
 * 2. 组合算法固定，通过传入不同的建造者，来生产不同的套餐
 */
class MealDirector extends Director {
	constructor(builder) {
		super();
		builder = builder;
		builder.buildFood();
		builder.buildDrink();
		return builder.getMeal();
	}
}
let hasDrinkMealBuilder = new HasDrinkMealBuilder();
let noDrinkMealBuilder = new NoDrinkMealBuilder();
let drinkMeal = new MealDirector(hasDrinkMealBuilder);
let foodMeal = new MealDirector(noDrinkMealBuilder); 

/***************** correct 案例/e ******************/

/**
 * 进一步思考
 * Q.既然组合逻辑基本固定，为何不能集成在builder中？
 * A.集成的实现需要继承，而现在独立成一个 Director类，是使用了组合的方式。符合“多用组合，少用继承”的原则
 * 
 * Q.按照封装不可变部分原则，该模式中哪些是可变，哪些是不可变
 * A.指挥者的组合的方式基本不可变，建造者的实现会变
 */