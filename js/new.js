function Person(name) {
    this.name = name;

    return {
        c: 1
    }
}

Person.prototype.getName = function () { return this.name }

function _new(constructor, ...rest) {
    let obj = {};
    Object.setPrototypeOf(obj, constructor.prototype);
    let ret = constructor.apply(obj, rest);
    return typeof ret === 'object' ? ret : obj;
}

function _newV2(ctx, ...rest) {
    let obj = Object.create(ctx.prototype);
    let res = ctx.apply(obj, rest);
    return typeof res === 'object' ? res : obj;
}

let cc = _newV2(Person, 'desen');



// 练习👇
/**
 * 要点
 * 1. 如果函数返回的是一个对象，则返回该对象，反之则返回实例
 * 2. 原型链实现
 * 3. 将person的this指向自己生成的obj
 */

function _newTestA(ctx, ...rest) {
    let obj = Object.create(ctx.prototype);
    let res = ctx.apply(obj, rest);
    return typeof res === 'object' ? res : obj
}

console.log(_newTestA(Person, 'desen'));
console.log(new Person('desen'));