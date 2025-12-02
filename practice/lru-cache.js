// 手写 LRU 缓存题目
// ===================
//
// 要求：实现 LRU (Least Recently Used) 缓存算法
//
// LRU 缓存：
// - 固定容量的缓存结构
// - 当缓存满时，删除最近最少使用的元素
// - 支持快速访问和更新
// - 时间复杂度：get 和 put 都是 O(1)

// 双向链表节点
class Node {
  constructor(key = null, value = null) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

// 请实现 LRUCache 类
class LRUCache {
  constructor(capacity) {
    // 在这里写你的实现
    // 提示：需要使用哈希表 + 双向链表
    this.capacity = capacity;
    this.cache = new Map();
    this.headNode = new Node();
    this.tailNode = new Node();
    this.headNode.next = this.tailNode;
    this.tailNode.prev = this.headNode;
  }

  // 获取缓存值
  get(key) {
    // 在这里写你的实现
    // 如果 key 存在，移到头部，返回值
    // 如果不存在，返回 -1
    const node = this.cache.get(key);
    if (node) {
      this.removeNode(node)
      this.addNodeToHead(node)
      return node.value
    } else {
      return -1;
    }

  }

  // 设置缓存值
  put(key, value) {
    // 在这里写你的实现
    // 如果 key 已存在，更新值，移到头部
    // 如果 key 不存在：
    //   - 如果缓存已满，删除尾部节点
    //   - 添加新节点到头部
    const node = this.cache.get(key);
    if (node) {
      node.value = value;
      this.removeNode(node)
      this.addNodeToHead(node);
    } else {
      const newNode = new Node(key, value)
      if (this.size() >= this.capacity) {
        // 删除尾部节点的 key
        this.delete(this.tailNode.prev.key);
      }
      this.addNodeToHead(newNode);
      this.cache.set(key, newNode);
    }

  }

  // 删除缓存值
  delete(key) {
    // 在这里写你的实现
    // 如果 key 存在，删除对应节点
    const node = this.cache.get(key);
    if (node) {
      this.removeNode(node);
      this.cache.delete(key);
    }
  }

  // 清空缓存
  clear() {
    // 在这里写你的实现
    this.cache.clear();
    this.headNode.next = this.tailNode;
    this.tailNode.prev = this.headNode;
  }

  // 获取缓存大小
  size() {
    // 在这里写你的实现
    return this.cache.size;
  }

  // 获取所有键（按最近使用顺序）
  keys() {
    // 在这里写你的实现
     const result = [];
    let current = this.headNode.next;
    
    while (current !== this.tailNode) {
      result.push(current.key);
      current = current.next;
    }
    
    return result;
  }
  // 删除某一个节点，从链表中
  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  // 将某一个节点移动到头部
  addNodeToHead(node) {
    this.headNode.next.prev = node;
    node.next = this.headNode.next;
    node.prev = this.headNode;
    this.headNode.next = node;
  }
}

// 测试用例
// ===============

console.log('=== 基础 LRU 测试 ===');

const cache = new LRUCache(3); // 容量为 3

// 测试 put 操作
cache.put('a', 1);
cache.put('b', 2);
cache.put('c', 3);

console.log('初始缓存大小:', cache.size()); // 3
console.log('缓存键顺序:', cache.keys()); // ['c', 'b', 'a'] (最近使用的在前)

// 测试 get 操作
console.log('获取 a:', cache.get('a')); // 1，a 移到头部
console.log('获取 a 后的键顺序:', cache.keys()); // ['a', 'c', 'b']

// 测试容量限制
cache.put('d', 4); // 容量已满，删除最少使用的 b
console.log('添加 d 后的缓存大小:', cache.size()); // 3
console.log('添加 d 后的键顺序:', cache.keys()); // ['d', 'a', 'c']
console.log('获取 b:', cache.get('b')); // -1，b 已被删除

console.log('\n=== 更新操作测试 ===');

cache.put('a', 100); // 更新已存在的 key
console.log('更新 a 后的值:', cache.get('a')); // 100
console.log('更新 a 后的键顺序:', cache.keys()); // ['a', 'd', 'c']

console.log('\n=== 删除操作测试 ===');

cache.delete('d');
console.log('删除 d 后的缓存大小:', cache.size()); // 2
console.log('删除 d 后的键顺序:', cache.keys()); // ['a', 'c']
console.log('获取 d:', cache.get('d')); // -1

console.log('\n=== 边界情况测试 ===');

const smallCache = new LRUCache(1);

smallCache.put('x', 10);
console.log('容量1缓存:', smallCache.get('x')); // 10

smallCache.put('y', 20); // x 被淘汰
console.log('添加 y 后获取 x:', smallCache.get('x')); // -1
console.log('添加 y 后获取 y:', smallCache.get('y')); // 20

console.log('\n=== 大容量性能测试 ===');

const largeCache = new LRUCache(1000);

// 添加 1000 个元素
console.time('添加1000个元素');
for (let i = 0; i < 1000; i++) {
  largeCache.put(`key${i}`, i);
}
console.timeEnd('添加1000个元素');

// 随机访问测试
console.time('随机访问1000次');
for (let i = 0; i < 1000; i++) {
  const randomKey = `key${Math.floor(Math.random() * 1000)}`;
  largeCache.get(randomKey);
}
console.timeEnd('随机访问1000次');

console.log('大缓存大小:', largeCache.size()); // 1000

console.log('\n=== 实际应用：函数缓存装饰器 ===');

// 创建函数缓存装饰器
function memoize(func, cacheSize = 100) {
  const cache = new LRUCache(cacheSize);

  return function (...args) {
    const key = JSON.stringify(args);

    let result = cache.get(key);
    if (result !== -1) {
      console.log('缓存命中:', args);
      return result;
    }

    console.log('缓存未命中，执行函数:', args);
    result = func.apply(this, args);
    cache.put(key, result);
    return result;
  };
}

// 模拟耗时的计算函数
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFib = memoize(fibonacci, 50);

console.log('计算斐波那契数列:');
console.log('fib(10):', memoizedFib(10)); // 首次计算
console.log('fib(10):', memoizedFib(10)); // 从缓存获取
console.log('fib(15):', memoizedFib(15)); // 首次计算
console.log('fib(10):', memoizedFib(10)); // 仍在缓存中

console.log('\n=== 实际应用：图片缓存 ===');

class ImageCache {
  constructor(maxSize = 10) {
    this.cache = new LRUCache(maxSize);
  }

  loadImage(url) {
    // 检查缓存
    let imageData = this.cache.get(url);
    if (imageData !== -1) {
      console.log(`从缓存加载图片: ${url}`);
      return Promise.resolve(imageData);
    }

    // 模拟图片加载
    console.log(`从网络加载图片: ${url}`);
    return new Promise(resolve => {
      setTimeout(() => {
        imageData = `图片数据: ${url} (${Date.now()})`;
        this.cache.put(url, imageData);
        resolve(imageData);
      }, 100);
    });
  }
}

const imageCache = new ImageCache(3);

const urls = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg'];

// 加载图片测试
async function testImageCache() {
  await imageCache.loadImage(urls[0]); // 加载 image1
  await imageCache.loadImage(urls[1]); // 加载 image2
  await imageCache.loadImage(urls[0]); // 从缓存获取 image1
  await imageCache.loadImage(urls[2]); // 加载 image3
  await imageCache.loadImage(urls[3]); // 加载 image4，淘汰最久未使用的

  console.log('最终缓存键:', imageCache.cache.keys());
}

testImageCache();

console.log('\n=== LRU vs 简单对象缓存对比 ===');

// 简单对象缓存（没有LRU策略）
function createSimpleCache() {
  const cache = {};
  return {
    get(key) { return cache[key]; },
    put(key, value) { cache[key] = value; },
    size() { return Object.keys(cache).length; }
  };
}

const simpleCache = createSimpleCache();
const lruCache = new LRUCache(3);

// 测试内存使用
console.log('添加大量数据到简单缓存...');
for (let i = 0; i < 10000; i++) {
  simpleCache.put(`key${i}`, `value${i}`);
}
console.log('简单缓存大小:', simpleCache.size()); // 10000 (内存泄漏风险)

console.log('添加大量数据到LRU缓存...');
for (let i = 0; i < 10000; i++) {
  lruCache.put(`key${i}`, `value${i}`);
}
console.log('LRU缓存大小:', lruCache.size()); // 3 (内存可控)

/*
参考答案：

class ListNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.size = 0;
    this.cache = new Map(); // 哈希表：key -> node

    // 创建头尾哨兵节点
    this.head = new ListNode(0, 0);
    this.tail = new ListNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key) {
    const node = this.cache.get(key);
    if (!node) {
      return -1;
    }

    // 移动到头部
    this.moveToHead(node);
    return node.value;
  }

  put(key, value) {
    const node = this.cache.get(key);

    if (node) {
      // 更新现有节点
      node.value = value;
      this.moveToHead(node);
    } else {
      // 创建新节点
      const newNode = new ListNode(key, value);
      this.cache.set(key, newNode);
      this.addToHead(newNode);
      this.size++;

      // 检查容量
      if (this.size > this.capacity) {
        const tail = this.removeTail();
        this.cache.delete(tail.key);
        this.size--;
      }
    }
  }

  delete(key) {
    const node = this.cache.get(key);
    if (node) {
      this.removeNode(node);
      this.cache.delete(key);
      this.size--;
    }
  }

  clear() {
    this.cache.clear();
    this.size = 0;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  size() {
    return this.size;
  }

  keys() {
    const keys = [];
    let current = this.head.next;

    while (current !== this.tail) {
      keys.push(current.key);
      current = current.next;
    }

    return keys;
  }

  // 辅助方法
  addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }

  removeTail() {
    const node = this.tail.prev;
    this.removeNode(node);
    return node;
  }
}

// 简化版本（使用 Map 的插入顺序特性）
class SimpleLRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      // 重新插入以更新顺序
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return -1;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的项（Map 的第一个项）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  keys() {
    return Array.from(this.cache.keys()).reverse();
  }
}
*/