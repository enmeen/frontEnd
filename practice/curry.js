// 手写函数柯里化题目
// ===================
//
// 要求：实现 curry 函数，将多参数函数转换为单参数函数链式调用
//
// 柯里化（Currying）：
// - 将一个接受多个参数的函数，转换为一系列接受单个参数的函数
// - 可以分步传递参数
// - 支持函数复用和参数复用

// 请实现基础版本的 curry 函数
function curry(fn) {
  // 在这里写你的实现
  // 提示：需要递归处理参数
  return function curried(...args){
    // 这里一个重点是 fn.length 代表函数的参数数量
    if(args.length >= fn.length){
      fn.call(this,...args)
    }else{
      return function(...nextArgs){
        return curried.apply(this,args.concat(nextArgs))
      }
    }
  }
}

// 请实现支持占位符的 curry 函数
function curryWithPlaceholder(fn, placeholder = '_') {
  // 在这里写你的实现
  // 提示：需要处理占位符参数的位置
}

// 请实现自动柯里化函数
function autoCurry(fn) {
  // 在这里写你的实现
  // 提示：根据原函数的参数长度自动判断是否需要继续柯里化
}

// 测试用例
// ===============

console.log('=== 基础柯里化测试 ===');

// 原始函数
function add(a, b, c) {
  return a + b + c;
}

function multiply(a, b, c, d) {
  return a * b * c * d;
}

// 柯里化
const curriedAdd = curry(add);
const curriedMultiply = curry(multiply);

// 测试
console.log('分步调用:');
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
console.log(curriedAdd(1, 2, 3)); // 6

console.log('\n乘法测试:');
console.log(curriedMultiply(2)(3)(4)(5)); // 120
console.log(curriedMultiply(2, 3)(4, 5));  // 120
console.log(curriedMultiply(2, 3, 4, 5));  // 120

console.log('\n=== 实际应用场景 ===');

// 示例1：创建专门的函数
const add10 = curriedAdd(10);
const add10And20 = add10(20);

console.log('add10(5):', add10(5));          // 15
console.log('add10And20(5):', add10And20(5)); // 35

// 示例2：数组处理
const map = curry((fn, arr) => arr.map(fn));
const double = x => x * 2;
const doubleArray = map(double);

console.log('doubleArray([1,2,3]):', doubleArray([1, 2, 3])); // [2, 4, 6]

// 示例3：字符串处理
const join = curry((separator, arr) => arr.join(separator));
const joinWithComma = join(',');
const joinWithSpace = join(' ');

console.log('joinWithComma([1,2,3]):', joinWithComma([1, 2, 3])); // '1,2,3'
console.log('joinWithSpace([1,2,3]):', joinWithSpace([1, 2, 3])); // '1 2 3'

console.log('\n=== 占位符测试 ===');

// 带占位符的柯里化
const curriedAddWithPlaceholder = curryWithPlaceholder(add);

// 使用占位符跳过某个参数
const add5And3 = curriedAddWithPlaceholder('_', 3);
console.log('add5And3(2):', add5And3(2)); // 2 + 3 + 2 = 7

const addFirstAndLast = curriedAddWithPlaceholder(1, '_');
console.log('addFirstAndLast(5, 9):', addFirstAndLast(5, 9)); // 1 + 5 + 9 = 15

console.log('\n=== 自动柯里化测试 ===');

// 自动柯里化会根据参数长度自动决定是否继续返回函数
const autoAdd = autoCurry(add);
const autoMultiply = autoCurry(multiply);

console.log('autoAdd(1, 2, 3):', autoAdd(1, 2, 3)); // 6
console.log('autoAdd(1)(2)(3):', autoAdd(1)(2)(3)); // 6
console.log('autoAdd(1, 2)(3):', autoAdd(1, 2)(3)); // 6

console.log('\n=== 高阶函数组合测试 ===');

// 组合多个柯里化函数
const filter = curry((predicate, arr) => arr.filter(predicate));
const isEven = x => x % 2 === 0;

// 创建数据处理管道
const processData = (data) => {
  return joinWithSpace(filter(isEven)(map(double)(data)));
};

const numbers = [1, 2, 3, 4, 5, 6];
console.log('原始数据:', numbers);
console.log('处理结果:', processData(numbers)); // '4 8 12'

console.log('\n=== 复杂应用：日志系统 ===');

// 创建带标签的日志函数
const createLogger = curry((level, tag, message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] [${tag}]: ${message}`);
});

// 创建专门的用户日志和错误日志
const userLog = createLogger('INFO')('USER');
const errorLog = createLogger('ERROR')('SYSTEM');

userLog('用户登录成功');
errorLog('数据库连接失败');

console.log('\n=== 偏函数应用测试 ===');

// 柯里化 vs 偏函数
function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}

const curriedGreet = curry(greet);

// 创建偏函数（固定部分参数）
const sayHello = curriedGreet('Hello');
const sayHelloToWorld = sayHello('World');
const sayHi = curriedGreet('Hi');

console.log(sayHelloToWorld('!'));   // 'Hello, World!'
console.log(sayHi('Alice', '.'));   // 'Hi, Alice.'

console.log('\n=== 性能测试 ===');

// 测试柯里化对性能的影响
function largeSum(a, b, c, d, e, f, g, h, i, j) {
  return a + b + c + d + e + f + g + h + i + j;
}

const curriedLargeSum = curry(largeSum);

const startTime1 = Date.now();
for (let i = 0; i < 100000; i++) {
  largeSum(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
}
const endTime1 = Date.now();

const startTime2 = Date.now();
for (let i = 0; i < 100000; i++) {
  curriedLargeSum(1)(2)(3)(4)(5)(6)(7)(8)(9)(10);
}
const endTime2 = Date.now();

console.log('原函数执行时间:', endTime1 - startTime1, 'ms');
console.log('柯里化函数执行时间:', endTime2 - startTime2, 'ms');

console.log('\n=== 边界情况测试 ===');

// 测试无参数函数
function noArgs() {
  return 'no arguments';
}

const curriedNoArgs = curry(noArgs);
console.log('无参数函数:', curriedNoArgs());

// 测试单参数函数
function singleArg(x) {
  return x * 2;
}

const curriedSingleArg = curry(singleArg);
console.log('单参数函数:', curriedSingleArg(5));

console.log('\n=== 函数式编程应用 ===');

// 使用柯里化实现函数式编程风格
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);

const add1 = x => x + 1;
const multiply2 = x => x * 2;
const toString = x => String(x);

// 组合函数
const pipeline = compose(toString, multiply2, add1);
console.log('函数组合 ( (1 + 1) * 2 ).toString():', pipeline(1)); // '4'

// 使用柯里化的compose
const curriedCompose = curry(compose);
const multiplyThenString = curriedCompose(toString, multiply2);
const addThenMultiplyThenString = multiplyThenString(add1);

console.log('柯里化组合 ( (1 + 1) * 2 ).toString():', addThenMultiplyThenString(1)); // '4'

/*
参考答案：

// 基础版本
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      // 参数足够，直接执行原函数
      return fn.apply(this, args);
    } else {
      // 参数不足，返回新的函数继续接收参数
      return function(...nextArgs) {
        return curried.apply(this, args.concat(nextArgs));
      };
    }
  };
}

// 带占位符的版本
function curryWithPlaceholder(fn, placeholder = '_') {
  return function curried(...args) {
    // 检查是否还有占位符
    const hasPlaceholder = args.includes(placeholder);
    const hasEnoughArgs = args.length >= fn.length && !hasPlaceholder;

    if (hasEnoughArgs) {
      return fn.apply(this, args);
    } else {
      return function(...nextArgs) {
        // 合并参数
        let newArgs = [...args];

        // 替换占位符
        for (let i = 0; i < newArgs.length && nextArgs.length > 0; i++) {
          if (newArgs[i] === placeholder) {
            newArgs[i] = nextArgs.shift();
          }
        }

        // 添加剩余参数
        newArgs = newArgs.concat(nextArgs);

        return curried.apply(this, newArgs);
      };
    }
  };
}

// 自动柯里化版本
function autoCurry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...nextArgs) {
        return curried.apply(this, args.concat(nextArgs));
      };
    }
  };
}

// 更简洁的实现方式：
const currySimple = fn => {
  const curried = (...args) =>
    args.length >= fn.length
      ? fn(...args)
      : (...nextArgs) => curried(...args, ...nextArgs);
  return curried;
};

// 支持this绑定的版本：
const curryWithThis = fn => {
  const curried = (...args) => {
    const context = this;
    return args.length >= fn.length
      ? fn.call(context, ...args)
      : (...nextArgs) => curried.call(context, ...args, ...nextArgs);
  };
  return curried;
};
*/