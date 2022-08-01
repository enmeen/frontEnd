/**
 * instanceof 判断一个对象是否是另一个对象（构造函数）的实例，返回boolean
 */



class Base { }

class A extends Base {
    constructor() {
        super()
    }
}

let a = new A();

console.log('a instanceof A ', a instanceof A);
console.log('a instanceof Base ', a instanceof Base);

/**
 * obj.__proto__ === constructor.prototype
 * @param {*} obj 
 * @param {*} constructor 
 * @returns 
 */

function _instanceof(obj, constructor) {
    let left = obj.__proto__;
    let right = constructor.prototype;
    while (left) {
        if (left === right) {
            return true;
        } else {
            left = left.__proto__;
        }
    }
    return false
}

function _instanceofV2(obj, ctx) {
    let right = ctx.prototype;
    let left = Object.getPrototypeOf(obj);
    while (left) {
        if (left === right) {
            return true;
        } else {
            left = Object.getPrototypeOf(left);
        }
    }
    return false;
}

console.log(_instanceof(a, A))
console.log(_instanceofV2(a, Base))