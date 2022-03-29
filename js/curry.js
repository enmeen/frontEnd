// 柯里化 实现 add(1)(2)(3) 参数固定

function add(x, y, z) {
    return x + y + z;
}
// 核心是 判断入参是否达到了目标
function curry(fn, ...args) {
    return args.length >= fn.length ? fn.apply(null, args) : (..._args) => curry(fn, ...args, ..._args);
}

let curryAdd = curry(add);


console.log(curryAdd(1)(2)(3));