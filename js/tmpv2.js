var length = 10;
function fn() {
    return this.length + 1;
}
let obj = {
    length: 5,
    test1() {
        debugger
        return this.length + 1;
    }
}

obj.test2 = fn;

console.log(obj.test1());
console.log(obj.test1.call());

// console.log(obj.test2());
// console.log(obj.test2.call());


var name = 'desen';
console.log(global.name)
function fn2() {
    return this.name;
}

console.log('fn2.call();', fn2.call(global));

