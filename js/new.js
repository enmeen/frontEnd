function Person(name) {
    this.name = name;

    return {
        c: 1
    }
}

Person.prototype.getName = function () { return this.name }

console.log(new Person('222'))


function _new(constructor, ...rest) {
    let obj = {};
    Object.setPrototypeOf(obj, constructor.prototype);
    let ret = constructor.apply(obj, rest);
    return typeof ret === 'object' ? ret : obj;
}

let cc = _new(Person, 'desen');

console.log(cc)
