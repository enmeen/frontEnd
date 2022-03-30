function curry(fn, ...arg) {
    return arg.length >= fn.length ? curry.apply(null, arg) : (..._arg) => curry(fn, ..._arg, ...arg);
}