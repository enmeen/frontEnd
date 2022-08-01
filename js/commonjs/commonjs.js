// commonjs规范的特性，check值的拷贝是浅拷贝还是深度拷贝

let count = { a: 1 };

function add() {
    count.a++;
}

setTimeout(() => {
    add();
}, 1000)

module.exports = {
    count,
    add
}