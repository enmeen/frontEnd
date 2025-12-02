// 手写 Promise.all 题目
// ===================
//
// 要求：实现一个 promiseAll 函数，功能与原生 Promise.all 相同。
//
// 功能要求：
// 1. 处理所有 Promise 都成功的情况，返回结果数组
// 2. 如果任一 Promise 失败，立即 reject
// 3. 处理空数组输入的情况
// 4. 不使用原生的 Promise.all
// 5. 保持结果顺序与输入数组一致

function promiseAll(promises) {
  // 在这里写你的实现
  // 提示：需要考虑 Promise 的状态和计数器

}

// 测试用例
// ===============

// 测试1: 所有 Promise 都成功
console.log('测试1: 所有 Promise 都成功');
const p1 = Promise.resolve(1);
const p2 = new Promise(resolve => setTimeout(() => resolve(2), 1000));
const p3 = Promise.resolve(3);

promiseAll([p1, p2, p3])
  .then(results => {
    console.log('成功:', results); // 应该输出 [1, 2, 3]
  })
  .catch(error => {
    console.log('失败:', error);
  });

// 测试2: 有一个 Promise 失败
setTimeout(() => {
  console.log('\n测试2: 有一个 Promise 失败');
  const p4 = Promise.reject('error occurred');
  promiseAll([p1, p4, p3])
    .then(results => {
      console.log('成功:', results);
    })
    .catch(error => {
      console.log('失败:', error); // 应该输出 'error occurred'
    });
}, 2000);

// 测试3: 空数组输入
setTimeout(() => {
  console.log('\n测试3: 空数组输入');
  promiseAll([])
    .then(results => {
      console.log('成功:', results); // 应该输出 []
    })
    .catch(error => {
      console.log('失败:', error);
    });
}, 3000);

// 测试4: 非 Promise 值
setTimeout(() => {
  console.log('\n测试4: 非 Promise 值');
  promiseAll([1, 'hello', true])
    .then(results => {
      console.log('成功:', results); // 应该输出 [1, 'hello', true]
    })
    .catch(error => {
      console.log('失败:', error);
    });
}, 4000);

/*
参考答案：
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    // 处理空数组情况
    if (!promises || promises.length === 0) {
      resolve([]);
      return;
    }

    const result = [];
    let count = 0;
    const len = promises.length;

    // 遍历所有 promises
    for (let i = 0; i < len; i++) {
      Promise.resolve(promises[i])
        .then(res => {
          result[i] = res;
          count++;

          // 当所有 promise 都完成时
          if (count === len) {
            resolve(result);
          }
        })
        .catch(err => {
          reject(err);
        });
    }
  });
}
*/