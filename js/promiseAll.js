

function promiseAll(array) {
    return new Promise((resolve, reject) => {
        let res = [];
        let count = 0; // 判断执行了几次，执行次数 === arr.lenth 时表示都执行了
        for (let i = 0; i < array.length; i++) {
            Promise.resolve(array[i]).then((data) => {
                count++
                res[i] = data;
                if (count === array.length) {
                    resolve(res);
                }
            }).catch((e) => {
                reject(e)
            })
        }
    })
}

function demo(wait) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(+new Date());
        }, wait)
    })
}

// Promise.all([demo(1000), demo(2000), demo(3000)]).then((res) => {
//     console.log(res)
// })


promiseAll([demo(1000), demo(2000), demo(3000)]).then((res) => {
    console.log(res)
})
