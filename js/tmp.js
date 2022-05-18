// let nums = [1, 2, 3, 4, 5, 6]
// for (let i = 0; i < nums.length; i++) {
//     Promise.resolve().then(function(){
//         console.log(i)
//     })
// }


// function Person(){}

// let p = new Person();

// p => Person.prototype => Object.prototype => null
 
// p.__proto__ === Person.prototype

// Person.__proto__ = Function.prototype => Object.prototype

let api = require('./commonjs/commonjs/commonjs');
console.log(api.count);
api.add();
console.log(api.count);