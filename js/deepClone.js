// 深拷贝

/**
 * 1. 遍历递归
 * 2. 循环引用
 * 3. 数组对象
 */
function deepClone(obj, map = new WeakMap()) {
    let result = Array.isArray(obj) ? [] : {};

    if (map.get(obj)) {
        return map.get(obj)
    }

    map.set(obj, result);
    for (let key in obj) {
        let value = obj[key];
        if (typeof value === 'object') {
            result[key] = deepClone(value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

let obj = [{ a: 1 }]

let newObj = deepClone(obj);

console.log('newObj', newObj);

console.log(newObj === obj);

