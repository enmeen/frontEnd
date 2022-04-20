/**
 * 是node的utils模块中的一个函数，作用就是为了转换最后一个参数是回调函数的函数为promise函数
 */

// fs.readFile('./index.js', (err, data) => {})

// let readFile = promisify(fs.readFile);

// readFile('./index.js').then((data) => { })


function promisify(fn) {
    return function (...rest) {
        return new Promise((resolve) => {
            fn.call(null, ...rest, (data) => {
                resolve(data);
            })
        })
    }
}

function st(time, cb) {
    console.log(time, cb)
    setTimeout(() => {
        cb('success');
    }, time)
}

st(2000, (res) => {
    console.log(res);
});

let newSt = promisify(st);

newSt(5000).then((data) => {
    console.log(data);
})