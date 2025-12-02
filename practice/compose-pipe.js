// 手写函数组合 pipe/compose 题目
// ===================
//
// 要求：实现 pipe 和 compose 函数，支持函数组合
//
// 函数组合：
// - 将多个函数组合成一个新函数
// - compose：从右到左执行 (f(g(x)))
// - pipe：从左到右执行 (g(f(x)))

// 请实现 compose 函数（从右到左）
function compose(...fns) {
  // 在这里写你的实现
  // 提示：需要检查参数，确保都是函数
  if (fns.length === 0) return arg => arg;
  if (fns.length === 1) return fns[0];

  fns.forEach(fn => {
    if (typeof fn !== 'function') {
      throw new TypeError('所有参数必须是函数');
    }
  });

  return function (...args){
    return fns.reduceRight((acc, fn)=>{
      return fn(acc);
    }, args[0]);
  }
}

// 请实现 pipe 函数（从左到右）
function pipe(...fns) {
  // 检查参数
  if (fns.length === 0) return arg => arg;
  if (fns.length === 1) return fns[0];

  // 确保所有参数都是函数
  fns.forEach(fn => {
    if (typeof fn !== 'function') {
      throw new TypeError('所有参数必须是函数');
    }
  });

  return function (...args) {
    return fns.reduce((acc, fn) => {
      return fn(acc);
    }, args[0]);
  };
}

// 请实现支持异步函数的 compose
async function composeAsync(...fns) {
  // 检查参数
  if (fns.length === 0) return async arg => arg;
  if (fns.length === 1) return fns[0];

  // 确保所有参数都是函数
  fns.forEach(fn => {
    if (typeof fn !== 'function') {
      throw new TypeError('所有参数必须是函数');
    }
  });

  return async function (...args) {
    let result = args[0];
    // 注意：异步组合必须使用 for 循环，不能用 reduceRight + await
    for (let i = fns.length - 1; i >= 0; i--) {
      result = await fns[i](result);
    }
    return result;
  };
}

// 请实现支持柯里化的 compose
function curryCompose() {
  const fns = [];

  const curried = (...newFns) => {
    fns.push(...newFns);
    return curried; // 返回自身继续构建
  };

  // 添加 value 方法来执行组合
  curried.value = (...args) => {
    if (fns.length === 0) return args[0];
    return compose(...fns)(...args);
  };

  return curried;
}

// 测试用例
// ===============

console.log('=== 基础函数组合测试 ===');

// 基础函数
const add1 = x => x + 1;
const multiply2 = x => x * 2;
const toString = x => String(x);
const split = str => str.split('');
const join = arr => arr.join('');

// 测试 compose
console.log('compose 测试:');
const composed = compose(toString, multiply2, add1);
console.log('compose(toString, multiply2, add1)(3):', composed(3));
// 执行流程: add1(3) -> multiply2(4) -> toString(8) = "8"

// 测试 pipe
console.log('\npipe 测试:');
const piped = pipe(add1, multiply2, toString);
console.log('pipe(add1, multiply2, toString)(3):', piped(3));
// 执行流程: add1(3) -> multiply2(4) -> toString(8) = "8"

console.log('\n=== 复杂数据处理测试 ===');

// 字符串处理函数
const toUpperCase = str => str.toUpperCase();
const trim = str => str.trim();
const addPrefix = prefix => str => `${prefix}: ${str}`;
const addSuffix = suffix => str => `${str} ${suffix}`;

// 使用 compose 处理字符串
const formatTitle = pipe(
  trim,
  toUpperCase,
  addPrefix('标题'),
  addSuffix('(已完成)')
);

console.log('格式化标题:', formatTitle('  学习 JavaScript  '));

console.log('\n=== 数组数据处理测试 ===');

// 数组处理函数
const filterEven = nums => nums.filter(x => x % 2 === 0);
const mapSquare = nums => nums.map(x => x * x);
const sum = nums => nums.reduce((a, b) => a + b, 0);
const toStringList = nums => `[${nums.join(', ')}]`;

// 处理数据流程
const processData = pipe(
  filterEven,
  mapSquare,
  toStringList
);

const numbers = [1, 2, 3, 4, 5, 6];
console.log('原始数组:', numbers);
console.log('处理后:', processData(numbers));

console.log('\n=== 异步函数组合测试 ===');

// 异步函数
const fetchData = async () => {
  console.log('获取数据中...');
  await new Promise(resolve => setTimeout(resolve, 100));
  return { id: 1, name: 'Alice', score: 85 };
};

const validateUser = user => {
  console.log('验证用户:', user);
  if (!user.name) throw new Error('用户名不能为空');
  return { ...user, valid: true };
};

const calculateGrade = user => {
  console.log('计算等级:', user);
  let grade;
  if (user.score >= 90) grade = 'A';
  else if (user.score >= 80) grade = 'B';
  else if (user.score >= 70) grade = 'C';
  else grade = 'D';
  return { ...user, grade };
};

const formatResult = user => {
  console.log('格式化结果:', user);
  return `${user.name} 的成绩是 ${user.score}，等级为 ${user.grade}`;
};

// 测试异步组合
const asyncProcess = composeAsync(
  formatResult,
  calculateGrade,
  validateUser,
  fetchData
);

asyncProcess().then(result => {
  console.log('异步处理结果:', result);
});

console.log('\n=== 柯里化组合测试 ===');

// 柯里化版本的 compose
const curriedCompose = curryCompose();
const step1 = curriedCompose(add1);
const step2 = step1(multiply2);
const step3 = step2(toString);

console.log('柯里化组合逐步构建:');
console.log('step3(5):', step3(5)); // (5 + 1) * 2 = 12 -> "12"

console.log('\n=== 错误处理测试 ===');

// 可能出错的函数
const mightThrow = x => {
  if (x < 0) throw new Error('不能为负数');
  return x;
};

const safeDivide = divisor => x => {
  if (divisor === 0) throw new Error('除数不能为0');
  return x / divisor;
};

// 测试错误处理
try {
  const safeProcess = compose(safeDivide(2), mightThrow);
  console.log('安全处理(10):', safeProcess(10));
  console.log('安全处理(-5):', safeProcess(-5)); // 会抛出错误
} catch (error) {
  console.log('捕获错误:', error.message);
}

console.log('\n=== 函数组合工具函数测试 ===');

// 创建特殊的组合函数
const composeWithLogging = (...fns) => {
  return (...args) => {
    console.log('输入参数:', args);
    let result = args;

    for (let i = fns.length - 1; i >= 0; i--) {
      const fn = fns[i];
      result = [fn(...result)];
      console.log(`第${fns.length - i}步 (${fn.name || '匿名'}):`, result[0]);
    }

    return result[0];
  };
};

const loggedProcess = composeWithLogging(add1, multiply2, toString);
console.log('带日志的组合:');
loggedProcess(3);

console.log('\n=== 实际应用：表单数据处理 ===');

// 表单数据处理函数
const trimValue = value => typeof value === 'string' ? value.trim() : value;
const toLowerCase = value => typeof value === 'string' ? value.toLowerCase() : value;
const removeSpaces = value => typeof value === 'string' ? value.replace(/\s+/g, '') : value;
const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error('邮箱格式无效');
  return email;
};

// 创建邮箱处理管道
const processEmail = pipe(
  trimValue,
  toLowerCase,
  removeSpaces,
  validateEmail
);

// 测试邮箱处理
try {
  console.log('邮箱处理:');
  console.log('原始:  "  USER@EXAMPLE.COM  "');
  console.log('处理后:', processEmail('  USER@EXAMPLE.COM  '));
} catch (error) {
  console.log('错误:', error.message);
}

console.log('\n=== 函数组合 vs 链式调用 ===');

// 链式调用风格
const array = [1, 2, 3, 4, 5];
const chained = array
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .join(', ');

console.log('链式调用:', chained);

// 函数组合风格
const arrayProcess = pipe(
  arr => arr.filter(x => x % 2 === 0),
  arr => arr.map(x => x * 2),
  arr => arr.join(', ')
);

console.log('函数组合:', arrayProcess([1, 2, 3, 4, 5]));

console.log('\n=== 性能测试 ===');

// 性能对比
const simpleAdd = x => x + 1;
const functions = Array(1000).fill(simpleAdd);

// 链式调用
const startTime1 = Date.now();
let result1 = 5;
for (let i = 0; i < 1000; i++) {
  result1 = simpleAdd(result1);
}
const endTime1 = Date.now();

// 函数组合
const startTime2 = Date.now();
const composedMany = compose(...functions);
const result2 = composedMany(5);
const endTime2 = Date.now();

console.log('链式调用结果:', result1, '耗时:', endTime1 - startTime1, 'ms');
console.log('函数组合结果:', result2, '耗时:', endTime2 - startTime2, 'ms');

/*
参考答案：

// 基础 compose
function compose(...fns) {
  // 检查参数
  if (fns.length === 0) return arg => arg;
  if (fns.length === 1) return fns[0];

  // 确保所有参数都是函数
  fns.forEach(fn => {
    if (typeof fn !== 'function') {
      throw new TypeError('所有参数必须是函数');
    }
  });

  return function(...args) {
    return fns.reduceRight((acc, fn) => {
      return fn(acc);
    }, args[0]);
  };
}

// 基础 pipe
function pipe(...fns) {
  return compose(...fns.reverse());
}

// 或者直接实现
function pipe(...fns) {
  if (fns.length === 0) return arg => arg;
  if (fns.length === 1) return fns[0];

  fns.forEach(fn => {
    if (typeof fn !== 'function') {
      throw new TypeError('所有参数必须是函数');
    }
  });

  return function(...args) {
    return fns.reduce((acc, fn) => {
      return fn(acc);
    }, args[0]);
  };
}

// 异步 compose
async function composeAsync(...fns) {
  if (fns.length === 0) return async arg => arg;
  if (fns.length === 1) return fns[0];

  return async function(...args) {
    let result = args[0];
    for (let i = fns.length - 1; i >= 0; i--) {
      result = await fns[i](result);
    }
    return result;
  };
}

// 柯里化 compose
function curryCompose() {
  const fns = [];

  const curried = (...newFns) => {
    fns.push(...newFns);
    return curried;
  };

  curried.value = (...args) => {
    if (fns.length === 0) return args[0];
    return compose(...fns)(...args);
  };

  return curried;
}

// 更简洁的实现：
const composeSimple = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const pipeSimple = (...fns) => x => fns.reduce((v, f) => f(v), x);

// 支持 Promise 的版本：
const composeWithPromise = (...fns) => async x => {
  return fns.reduceRight(async (acc, fn) => {
    const result = await acc;
    return fn(result);
  }, Promise.resolve(x));
};
*/