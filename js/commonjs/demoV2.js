// 浅拷贝，如果 count 是基本类型，则不会被修改。如果是引用类型，则会被修改

let api = require('./commonjs');

setTimeout(() => {
    console.log(api.count);
}, 5000)

module.exports = {
    b: 1
}