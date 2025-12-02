// 手写发布订阅模式题目
// ===================
//
// 要求：实现 EventEmitter 类，支持发布订阅模式
//
// 发布订阅模式：
// - 发布者（Publisher）发布事件，不关心谁在监听
// - 订阅者（Subscriber）订阅事件，不关心谁在发布
// - 通过事件中心（EventEmitter）进行解耦

// 请实现 EventEmitter 类
class EventEmitter {
  constructor() {
    // 在这里写你的实现
    // 提示：需要一个事件存储对象来保存回调函数
    this.events = {};
  }

  // 订阅事件
  on(event, callback) {
    // 在这里写你的实现
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // 订阅事件（只执行一次）
  once(event, callback) {
    // 在这里写你的实现
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  // 发布事件
  emit(event, ...args) {
    // 在这里写你的实现
    if (!this.events[event]) {
      return false; // 没有监听器
    }
    // 注意：复制一份监听器数组，避免在执行过程中被修改
    const listeners = [...this.events[event]];
    listeners.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`事件 ${event} 的监听器执行出错:`, error);
      }
    });
    return true; // 有监听器执行
  }

  // 取消订阅
  off(event, callback) {
    // 在这里写你的实现
    if (!this.events[event]) {
      return;
    }
    
    if (!callback) {
      // 如果没有指定回调，移除该事件的所有监听器
      delete this.events[event];
      return;
    }
    // 移除指定的回调
    this.events[event] = this.events[event].filter(listener => listener !== callback);
    
    // 注意：如果没有监听器了，删除事件。
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  // 获取事件监听器数量
  listenerCount(event) {
    // 在这里写你的实现
  }

  // 获取所有事件名
  eventNames() {
    // 在这里写你的实现
  }

  // 移除所有监听器
  removeAllListeners(event) {
    // 在这里写你的实现
  }
}

// 测试用例
// ===============

console.log('=== 基础发布订阅测试 ===');

const emitter = new EventEmitter();

// 订阅事件
const callback1 = (data) => console.log('监听器1收到:', data);
const callback2 = (data) => console.log('监听器2收到:', data);

emitter.on('test', callback1);
emitter.on('test', callback2);

// 发布事件
console.log('发布第一个事件:');
emitter.emit('test', 'Hello World');

// 测试 once
console.log('\n=== once 测试 ===');
emitter.once('once-event', (data) => {
  console.log('once事件只执行一次:', data);
});

console.log('第一次触发:');
emitter.emit('once-event', '第一次');
console.log('第二次触发:');
emitter.emit('once-event', '第二次');

console.log('\n=== 取消订阅测试 ===');

// 移除一个监听器
emitter.off('test', callback1);
console.log('移除callback1后发布:');
emitter.emit('test', '移除callback1后');

// 移除所有监听器
emitter.removeAllListeners('test');
console.log('移除所有监听器后发布:');
emitter.emit('test', '移除所有监听器后');

console.log('\n=== 多个事件测试 ===');

const userEmitter = new EventEmitter();

userEmitter.on('login', (user) => console.log('用户登录:', user.name));
userEmitter.on('logout', (user) => console.log('用户登出:', user.name));
userEmitter.on('purchase', (item) => console.log('购买商品:', item));

userEmitter.emit('login', { name: 'Alice', id: 1 });
userEmitter.emit('purchase', 'iPhone 15');
userEmitter.emit('logout', { name: 'Alice', id: 1 });

console.log('\n=== 工具方法测试 ===');

console.log('事件名称列表:', userEmitter.eventNames());
console.log('login事件监听器数量:', userEmitter.listenerCount('login'));
console.log('purchase事件监听器数量:', userEmitter.listenerCount('purchase'));
console.log('不存在的事件监听器数量:', userEmitter.listenerCount('nonexistent'));

console.log('\n=== 错误处理测试 ===');

// 测试发布不存在的事件
console.log('发布不存在的事件:');
emitter.emit('nonexistent-event', '应该不会有任何输出');

console.log('\n=== 实际应用场景：简单的电商系统 ===');

const shopEmitter = new EventEmitter();

// 库存管理
let inventory = {
  'iphone': 10,
  'macbook': 5
};

// 订阅库存变化事件
shopEmitter.on('stock-change', (product, quantity) => {
  inventory[product] = quantity;
  console.log(`库存更新: ${product} 现有 ${quantity} 件`);
});

// 订阅购买事件
shopEmitter.on('purchase', (product, quantity) => {
  const currentStock = inventory[product] || 0;
  if (currentStock >= quantity) {
    console.log(`成功购买: ${product} x${quantity}`);
    shopEmitter.emit('stock-change', product, currentStock - quantity);
  } else {
    console.log(`库存不足: ${product} 只剩 ${currentStock} 件`);
  }
});

// 订阅补货事件
shopEmitter.on('restock', (product, quantity) => {
  const currentStock = inventory[product] || 0;
  shopEmitter.emit('stock-change', product, currentStock + quantity);
  console.log(`补货完成: ${product} +${quantity} 件`);
});

// 模拟购买流程
console.log('=== 模拟购买流程 ===');
shopEmitter.emit('purchase', 'iphone', 2);  // 购买2台iPhone
shopEmitter.emit('purchase', 'macbook', 3); // 购买3台MacBook
shopEmitter.emit('purchase', 'iphone', 10); // 尝试购买10台iPhone（库存不足）
shopEmitter.emit('restock', 'iphone', 5);   // iPhone补货5台
shopEmitter.emit('purchase', 'iphone', 3);  // 再次购买3台iPhone

console.log('\n=== 高级特性测试 ===');

// 测试同一个事件的多个监听器执行顺序
console.log('监听器执行顺序:');
const orderEmitter = new EventEmitter();

orderEmitter.on('order-test', () => console.log('第一个监听器'));
orderEmitter.on('order-test', () => console.log('第二个监听器'));
orderEmitter.on('order-test', () => console.log('第三个监听器'));
orderEmitter.emit('order-test');

// 测试带参数的事件
console.log('\n带参数的事件:');
orderEmitter.on('param-test', (a, b, c) => {
  console.log('收到参数:', a, b, c);
});
orderEmitter.emit('param-test', 1, 'hello', { obj: true });

/*
参考答案：

class EventEmitter {
  constructor() {
    this.events = {}; // 存储所有事件
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this; // 支持链式调用
  }

  once(event, callback) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event] || this.events[event].length === 0) {
      return false; // 没有监听器
    }

    // 复制一份监听器数组，避免在执行过程中被修改
    const listeners = [...this.events[event]];

    listeners.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`事件 ${event} 的监听器执行出错:`, error);
      }
    });

    return true; // 有监听器执行
  }

  off(event, callback) {
    if (!this.events[event]) {
      return this;
    }

    if (!callback) {
      // 如果没有指定回调，移除该事件的所有监听器
      delete this.events[event];
      return this;
    }

    // 移除指定的回调
    this.events[event] = this.events[event].filter(listener => listener !== callback);

    // 如果没有监听器了，删除事件
    if (this.events[event].length === 0) {
      delete this.events[event];
    }

    return this;
  }

  listenerCount(event) {
    return this.events[event] ? this.events[event].length : 0;
  }

  eventNames() {
    return Object.keys(this.events);
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}

// 更简化的版本：
class SimpleEventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  emit(event, ...args) {
    const callbacks = this.events.get(event) || [];
    callbacks.forEach(callback => callback(...args));
  }

  off(event, callback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}
*/