/**
 * 抽象工厂方法模式
 *
 * 成员：
 * 1. 多个抽象产品类
 * 2. 具体产品类
 * 3. 抽象工厂类 - 声明(一组)返回抽象产品的方法
 * 4. 具体工厂类 - 生成(一组)具体产品
 *
 * 何时使用：
 * 在需要返回不是一类产品，而是一组产品时可使用
 *
 * 名词解析：
 * 产品族👇
 * 在抽象工厂模式中，产品族是指由同一个工厂生产的，位于不同产品等级结构中的一组产品，如海尔电器工厂生产的海尔电视机、海尔电冰箱，海尔电视机位于电视机产品等级结构中，海尔电冰箱位于电冰箱产品等级结构中。
 * 另一个例子来说，我们常说的电脑，包含鼠标、键盘、主机、显示器。这些共同组成了电脑，但归属不同的单元
 *  
 * 优点：
 * 当一个产品族中的多个对象被设计成一起工作时，它能保证客户端始终只使用同一个产品族中的对象。
 * 缺点：
 * 产品族扩展非常困难
 * 
 * 总结：
 * 不同于工厂方法模式，只返回一类产品。抽象工厂模式，可以返回多种产品（最好这些产品也是有所关联的，如共同组成电脑的 键盘 和 鼠标）。
 *
 * 举例：
 * 海尔工厂生产海尔冰箱、海尔洗衣机。这些产品的属性不同，但是都源自一个海尔工厂
 * 
 * 类图：
 * https://www.runoob.com/wp-content/uploads/2014/08/3E13CDD1-2CD2-4C66-BD33-DECBF172AE03.jpg
 */

/****** 共同组成 键盘鼠标套装 抽象 / start ********/
abstract class Keyboard {
	input() {} // 有各自不同的属性和方法
}

abstract class Mouse {
	click() {}
}
/****** 共同组成 键盘鼠标套装 抽象 / end ********/

class OfficeKeyboard extends Keyboard {}

class GameKeyboard extends Keyboard {}

class GameMouse extends Mouse {}

class OfficeMouse extends Mouse {}

export abstract class Factory {
	getKeyBoard() {}

	getMouse() {}
}

class OfficeFactory extends Factory {
	getKeyBoard() {
		return new OfficeKeyboard();
	}
	getMouse() {
		return new OfficeMouse();
	}
}

class GameFactory extends Factory {
	getKeyBoard() {
		return new GameKeyboard();
	}
	getMouse() {
		return new GameMouse();
	}
}
