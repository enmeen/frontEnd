// 手写防抖与节流题目
// ===================
//
// 要求：实现 debounce（防抖）和 throttle（节流）函数
//
// debounce: 在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时
// throttle: 规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效

// 请实现 debounce 函数
function debounce(func, delay) {
  let timeoutId = null;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 请实现 throttle 函数
function throttle(func, delay) {
  let lastTime = 0;
  let timeoutId = null;
  return function (...args) {
    const now = Date.now();
    const remaining = delay - (now - lastTime);

    if (remaining <= 0) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastTime = now;
      func.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now();
        timeoutId = null;
        func.apply(this, args);
      }, remaining);
    }
  }
}

  // 测试用例
  // ===============

  // 模拟事件触发函数
  function logTime(message) {
    console.log(message, new Date().toLocaleTimeString());
  }

  console.log('=== 防抖测试 ===');
  console.log('快速点击多次，应该只执行最后一次');

  // 防抖测试 - 快速点击多次
  const debouncedLog = debounce(logTime, 1000);

  // 模拟快速点击
  let clickCount = 0;
  const clickInterval = setInterval(() => {
    clickCount++;
    debouncedLog(`点击 ${clickCount}`);

    if (clickCount >= 5) {
      clearInterval(clickInterval);
      console.log('停止点击，等待1秒后应该输出最后一次');
    }
  }, 200);

  // 节流测试
  setTimeout(() => {
    console.log('\n=== 节流测试 ===');
    console.log('持续触发，应该每2秒执行一次');

    const throttledLog = throttle(logTime, 2000);

    // 模拟持续触发
    let triggerCount = 0;
    const triggerInterval = setInterval(() => {
      triggerCount++;
      throttledLog(`触发 ${triggerCount}`);

      if (triggerCount >= 10) {
        clearInterval(triggerInterval);
        console.log('停止触发');
      }
    }, 300);

  }, 7000);

  // 进阶测试：立即执行版
  setTimeout(() => {
    console.log('\n=== 进阶版防抖测试（立即执行）===');

    function debounceImmediate(func, delay) {
      // 实现立即执行的防抖
      // 第一次触发时立即执行，后续触发重新计时
    }

    const immediateDebouncedLog = debounceImmediate(logTime, 1000);

    immediateDebouncedLog('立即执行1');
    setTimeout(() => immediateDebouncedLog('立即执行2'), 200);
    setTimeout(() => immediateDebouncedLog('立即执行3'), 400);

    console.log('应该立即执行第一次，后续触发重新计时');

  }, 12000);

/*
参考答案：

// 基础防抖
function debounce(func, delay) {
  let timeoutId;

  return function(...args) {
    const context = this;

    // 清除之前的定时器
    clearTimeout(timeoutId);

    // 设置新的定时器
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

// 基础节流
function throttle(func, delay) {
  let lastTime = 0;
  let timeoutId;

  return function(...args) {
    const context = this;
    const currentTime = Date.now();

    if (currentTime - lastTime >= delay) {
      // 立即执行
      func.apply(context, args);
      lastTime = currentTime;
    } else {
      // 清除之前的定时器
      clearTimeout(timeoutId);

      // 延迟到下一个可执行时间
      timeoutId = setTimeout(() => {
        func.apply(context, args);
        lastTime = Date.now();
      }, delay - (currentTime - lastTime));
    }
  };
}

// 立即执行版防抖
function debounceImmediate(func, delay) {
  let timeoutId;
  let firstCall = true;

  return function(...args) {
    const context = this;

    if (firstCall) {
      func.apply(context, args);
      firstCall = false;
      return;
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}
*/