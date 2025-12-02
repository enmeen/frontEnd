// 手写深拷贝题目
// ===================
//
// 要求：实现 deepClone 函数，实现对象的深拷贝
//
// 深拷贝 vs 浅拷贝：
// 浅拷贝：只复制第一层属性，嵌套对象仍然是引用
// 深拷贝：递归复制所有层级的对象和数组

// 请实现基础版本的 deepClone
function deepClone(obj) {
  // 处理 null 和基本类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  // 处理普通对象
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

// 请实现增强版本的 deepClone（处理循环引用）
function deepCloneWithCircular(obj) {
  // 在这里写你的实现
  // 提示：使用 WeakMap 来处理循环引用
}

// 请实现完整版本的 deepClone（处理所有数据类型）
function deepCloneComplete(obj, hash = new WeakMap()) {
  // 处理 null 和基本类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  let cloned;

  // 处理 Date，返回新的 Date 实例
  if (obj instanceof Date) {
    cloned = new Date(obj.getTime());
    hash.set(obj, cloned);
    return cloned;
  }

  // 处理 RegExp，返回新的 RegExp 实例
  if (obj instanceof RegExp) {
    // 这里使用了 RegExp 实例自带的属性
    cloned = new RegExp(obj.source, obj.flags);
    hash.set(obj, cloned);
    return cloned;
  }

  // 处理 Map，返回新的 Map 实例，并递归克隆键和值
  if (obj instanceof Map) {
    cloned = new Map();
    hash.set(obj, cloned);
    obj.forEach((value, key) => {
      // 注意：key也要深拷贝
      cloned.set(deepCloneComplete(key, hash), deepCloneComplete(value, hash));
    });
    return cloned;
  }

  // 处理 Set
  if (obj instanceof Set) {
    cloned = new Set();
    hash.set(obj, cloned);
    obj.forEach(value => {
      // 注意：value也要深拷贝
      cloned.add(deepCloneComplete(value, hash));
    });
    return cloned;
  }

  // 处理 Array
  if (Array.isArray(obj)) {
    cloned = [];
    hash.set(obj, cloned);
    obj.forEach((item, index) => {
      cloned[index] = deepCloneComplete(item, hash);
    });
    return cloned;
  }

  // 处理 Function (直接返回引用，函数通常不需要深拷贝)
  if (typeof obj === 'function') {
    return obj;
  }

  // 处理普通 Object (包括自定义对象实例)
  cloned = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, cloned);

  // 处理普通属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepCloneComplete(obj[key], hash);
    }
  }

  // 处理 Symbol 属性
  const symbolKeys = Object.getOwnPropertySymbols(obj);
  for (const symKey of symbolKeys) {
    cloned[symKey] = deepCloneComplete(obj[symKey], hash);
  }

  return cloned;
}

// 测试用例
// ===============

console.log('=== 基础深拷贝测试 ===');

const original1 = {
  name: 'John',
  age: 30,
  hobbies: ['reading', 'coding'],
  address: {
    city: 'Beijing',
    country: 'China'
  }
};

const cloned1 = deepClone(original1);
cloned1.address.city = 'Shanghai';
cloned1.hobbies.push('gaming');

console.log('原对象:', original1);
console.log('克隆对象:', cloned1);
console.log('地址是否分离:', original1.address.city !== cloned1.address.city);
console.log('数组是否分离:', !original1.hobbies.includes('gaming'));

console.log('\n=== 循环引用测试 ===');

const original2 = {
  name: 'circular'
};
original2.self = original2; // 循环引用

try {
  const cloned2 = deepClone(original2); // 基础版本会栈溢出
  console.log('基础版本成功（不应该）');
} catch (error) {
  console.log('基础版本失败（预期）:', error.message);
}

const cloned2Enhanced = deepCloneWithCircular(original2);
console.log('增强版本成功:', cloned2Enhanced);
console.log('循环引用保持:', cloned2Enhanced.self === cloned2Enhanced);

console.log('\n=== 完整类型测试 ===');

const original3 = {
  date: new Date('2024-01-01'),
  regex: /test/gi,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  func: function () { return 'hello'; },
  symbol: Symbol('test'),
  null: null,
  undefined: undefined,
  number: 42,
  string: 'hello',
  boolean: true
};

const cloned3 = deepCloneComplete(original3);

console.log('Date 类型:', cloned3.date instanceof Date, cloned3.date.getTime());
console.log('RegExp 类型:', cloned3.regex instanceof RegExp, cloned3.regex.toString());
console.log('Map 类型:', cloned3.map instanceof Map, cloned3.map.get('key'));
console.log('Set 类型:', cloned3.set instanceof Set, [...cloned3.set]);
console.log('Function 类型:', typeof cloned3.func, cloned3.func());
console.log('Symbol 类型:', typeof cloned3.symbol);
console.log('基本类型:', cloned3.null, cloned3.undefined, cloned3.number);

console.log('\n=== 性能对比测试 ===');

// 生成大型对象
function generateLargeObject(depth, breadth = 3) {
  if (depth === 0) return Math.random();

  const obj = {};
  for (let i = 0; i < breadth; i++) {
    obj[`prop${i}`] = generateLargeObject(depth - 1, breadth);
  }
  return obj;
}

const largeObj = generateLargeObject(5, 2);
console.log('生成大型对象，深度5，宽度2');

// 测试 JSON.stringify + JSON.parse 的简单深拷贝
const startTime1 = Date.now();
const jsonClone = JSON.parse(JSON.stringify(largeObj));
const endTime1 = Date.now();
console.log('JSON 方法耗时:', endTime1 - startTime1, 'ms');

// 测试我们的深拷贝
const startTime2 = Date.now();
const deepCloneResult = deepCloneComplete(largeObj);
const endTime2 = Date.now();
console.log('深拷贝方法耗时:', endTime2 - startTime2, 'ms');

console.log('\n=== 边界情况测试 ===');

console.log('空对象:', deepClone({}));
console.log('空数组:', deepClone([]));
console.log('null:', deepClone(null));
console.log('undefined:', deepClone(undefined));
console.log('纯数字:', deepClone(42));

console.log('\n=== 数组深拷贝专项测试 ===');

const original4 = [1, [2, [3, 4]], { nested: [5, 6] }];
const cloned4 = deepClone(original4);
cloned4[1][1][0] = 'changed';
cloned4[2].nested[0] = 'modified';

console.log('原数组:', original4);
console.log('克隆数组:', cloned4);
console.log('深度嵌套数组是否分离:', original4[1][1][0] !== cloned4[1][1][0]);

/*
参考答案：

// 基础版本
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

// 处理循环引用的版本
function deepCloneWithCircular(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  let cloned;

  if (Array.isArray(obj)) {
    cloned = [];
    hash.set(obj, cloned);
    obj.forEach((item, index) => {
      cloned[index] = deepCloneWithCircular(item, hash);
    });
  } else {
    cloned = {};
    hash.set(obj, cloned);
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepCloneWithCircular(obj[key], hash);
      }
    }
  }

  return cloned;
}

// 完整版本
function deepCloneComplete(obj, hash = new WeakMap()) {
  // 处理 null 和非对象
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  let cloned;

  // 处理 Date
  if (obj instanceof Date) {
    cloned = new Date(obj.getTime());
    hash.set(obj, cloned);
    return cloned;
  }

  // 处理 RegExp
  if (obj instanceof RegExp) {
    cloned = new RegExp(obj.source, obj.flags);
    hash.set(obj, cloned);
    return cloned;
  }

  // 处理 Map
  if (obj instanceof Map) {
    cloned = new Map();
    hash.set(obj, cloned);
    obj.forEach((value, key) => {
      cloned.set(deepCloneComplete(key, hash), deepCloneComplete(value, hash));
    });
    return cloned;
  }

  // 处理 Set
  if (obj instanceof Set) {
    cloned = new Set();
    hash.set(obj, cloned);
    obj.forEach(value => {
      cloned.add(deepCloneComplete(value, hash));
    });
    return cloned;
  }

  // 处理 Array
  if (Array.isArray(obj)) {
    cloned = [];
    hash.set(obj, cloned);
    obj.forEach((item, index) => {
      cloned[index] = deepCloneComplete(item, hash);
    });
    return cloned;
  }

  // 处理普通 Object
  cloned = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, cloned);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepCloneComplete(obj[key], hash);
    }
  }

  // 处理 Symbol 属性
  const symbolKeys = Object.getOwnPropertySymbols(obj);
  for (const symKey of symbolKeys) {
    cloned[symKey] = deepCloneComplete(obj[symKey], hash);
  }

  return cloned;
}

// 更简洁的版本（不考虑特殊类型）：
const simpleDeepClone = obj => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (obj instanceof Array) return obj.map(simpleDeepClone);
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, simpleDeepClone(v)])
    );
  }
};
*/

function deepClone(obj, hash = new WeakMap()) {
  // 处理 null 和非对象
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  let cloned;
  // 处理date
  if (obj instanceof Date) {
    clone = new Date(obj.getTime());
    hash.set(obj.cloned);
    return cloned;
  }

  // 处理RegExp
  if (obj instanceof RegExp) {
    cloned = new RegExp(obj.source, obj.flags);
    hash.set(obj, cloned);
    return cloned;
  }

  // 处理Map
  if (obj instanceof Map) {
    cloned = new Map();
    obj.forEach((value, key) => {
      cloned.set(deepCloneComplete(key, hash), deepCloneComplete(value, hash));
    });
    hash.set(obj, cloned);
    return cloned;
  }

  // 处理Set
  if (obj instanceof Set) {
    cloned = new Set();
    obj.forEach(value => {
      cloned.add(deepCloneComplete(value, hash));
    });
    hash.set(obj, cloned);
    return cloned;
  }

  // 处理Array
  if (Array.isArray(obj)) {
    clone = [];
    obj.forEach((item, index) => {
      cloned[index] = deepCloneComplete(item, hash);
    });
    hash.set(obj, cloned);
    return cloned;
  }

  // 处理Function
  if (typeof obj === 'function') {
    return obj;
  }

  // 处理普通Object
  // 继承原型
  cloned = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, cloned);

  // 处理普通属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepCloneComplete(obj[key], hash);
    }
  }

  // 处理Symbol属性
  const symbolKeys = Object.getOwnPropertySymbols(obj);
  for (const symKey of symbolKeys) {
    cloned[symKey] = deepCloneComplete(obj[symKey], hash);
  }

  return cloned;
}

function deepClone_test(obj){
  // 如果是null、基本类型则直接返回。
  // 传入 hash = new WeakMap() 处理循环引用

  // 如果是function 不处理
  // 如果是 Regex、Date、Array、Set、Map 则new一个
  // 如果是map，则循环处理
  // 如果是数组 则循环处理
  // 如果是对象，则循环处理，key、value都要新建，value要使用deepClone_test递归。
  //  1. 要用 hasOwnProperty
  //  2. 新clone的对象要做好继承
  // 如果是 symbol ，则循环处理
  // 1. 利用getOwnPropertySymbols从obj获取 symbol 

}