// 手写数组扁平化题目
// ===================
//
// 要求：实现 flatten 函数，将多维数组转换为一维数组
//
// 示例：
// flatten([1, [2, [3, 4], 5], 6]) => [1, 2, 3, 4, 5, 6]
// flatten([[1, 2], [3, 4], 5]) => [1, 2, 3, 4, 5]

// 请实现 flatten 函数 - 递归版本
function flatten(arr) {
  function helper(input) {
    const result = [];
    for (const item of input) {
      if (Array.isArray(item)) {
        result.push(...helper(item));
      } else {
        result.push(item);
      }
    }
    return result;
  }
  return helper(arr);
}

// 请实现 flatten 函数 - 迭代版本（不使用递归）
function flattenIterative(arr) {
  const result = [];
  const stack = [...arr]; // 复制数组作为栈

  while (stack.length > 0) {
    const item = stack.pop(); // 从栈顶取出元素（这是因为从栈顶处理更方便， 为O(1)）

    if (Array.isArray(item)) {
      // 如果是数组，将其元素展开并压入栈中
      stack.push(...item);
    } else {
      // 如果不是数组，直接添加到结果中
      result.push(item);
    }
  }

  // 因为是逆序添加的，需要反转
  return result.reverse();
}

// 请实现 flatten 函数 - 带深度参数
function flattenWithDepth(arr, depth = 1) {
  // 在这里写你的实现
  // depth: 扁平化的深度，1表示只扁平化第一层
  // Infinity表示完全扁平化
}

// 请实现 flatten 函数 - 原型链方法
Array.prototype.myFlat = function(depth = 1) {
  // 在这里写你的实现
  // 实现 Array.prototype.flat 的功能
};

// 测试用例
// ===============

console.log('=== 基础扁平化测试 ===');

const test1 = [1, [2, [3, 4], 5], 6];
console.log('原数组:', test1);
console.log('递归版本:', flatten(test1));           // [1, 2, 3, 4, 5, 6]
console.log('迭代版本:', flattenIterative(test1));   // [1, 2, 3, 4, 5, 6]

console.log('\n=== 深度控制测试 ===');

const test2 = [[1, 2], [3, [4, [5]]], 6];
console.log('原数组:', test2);
console.log('深度1:', flattenWithDepth(test2, 1));     // [1, 2, 3, [4, [5]], 6]
console.log('深度2:', flattenWithDepth(test2, 2));     // [1, 2, 3, 4, [5], 6]
console.log('深度Infinity:', flattenWithDepth(test2, Infinity)); // [1, 2, 3, 4, 5, 6]

console.log('\n=== 原型链方法测试 ===');

const test3 = [1, [2, [3, 4]], 5];
console.log('原数组:', test3);
console.log('myFlat(1):', test3.myFlat(1));    // [1, 2, [3, 4], 5]
console.log('myFlat(2):', test3.myFlat(2));    // [1, 2, 3, 4, 5]

console.log('\n=== 边界情况测试 ===');

console.log('空数组:', flatten([]));
console.log('非数组元素:', flatten([1, 'hello', [true, null], undefined]));
console.log('混合类型:', flatten([{}, [function() {}, []], []]));

console.log('\n=== 性能对比测试 ===');

// 生成大量数据的嵌套数组
function generateLargeArray(depth, breadth = 3) {
  if (depth === 0) return 1;
  const arr = [];
  for (let i = 0; i < breadth; i++) {
    arr.push(generateLargeArray(depth - 1, breadth));
  }
  return arr;
}

const largeArray = generateLargeArray(4, 2); // 2^4 = 16 个元素
console.log('大数组测试:', largeArray.length, '层嵌套');

const startTime = Date.now();
const result1 = flatten(largeArray);
const endTime = Date.now();
console.log('递归版本耗时:', endTime - startTime, 'ms');

const startTime2 = Date.now();
const result2 = flattenIterative(largeArray);
const endTime2 = Date.now();
console.log('迭代版本耗时:', endTime2 - startTime2, 'ms');

console.log('结果一致:', JSON.stringify(result1) === JSON.stringify(result2));

/*
参考答案：

// 递归版本
function flatten(arr) {
  const result = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }

  return result;
}

// 迭代版本 - 使用栈
function flattenIterative(arr) {
  const result = [];
  const stack = [...arr];

  while (stack.length) {
    const item = stack.pop();

    if (Array.isArray(item)) {
      stack.push(...item);
    } else {
      result.push(item);
    }
  }

  return result.reverse(); // 因为是逆序添加的
}

// 带深度参数
function flattenWithDepth(arr, depth = 1) {
  if (depth === 0) return arr;

  const result = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flattenWithDepth(item, depth - 1));
    } else {
      result.push(item);
    }
  }

  return result;
}

// 原型链方法
Array.prototype.myFlat = function(depth = 1) {
  if (depth === 0) return this;

  const result = [];

  for (const item of this) {
    if (Array.isArray(item)) {
      result.push(...item.myFlat(depth - 1));
    } else {
      result.push(item);
    }
  }

  return result;
};

// 更简洁的实现方法：
const flatten = arr => arr.reduce((acc, val) =>
  Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);

const flattenWithDepth = (arr, depth = 1) =>
  depth > 0 ? arr.reduce((acc, val) =>
    acc.concat(Array.isArray(val) ? flattenWithDepth(val, depth - 1) : val), []) : arr;
*/