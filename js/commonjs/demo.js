// 浅拷贝，如果 count 是基本类型，则不会被修改。如果是引用类型，则会被修改

let api = require('./commonjs');
console.log(api.count);
api.add();
console.log(api.count);