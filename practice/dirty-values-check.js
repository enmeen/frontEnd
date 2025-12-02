// 手写脏数据检测题目
// ===================
//
// 要求：实现一个脏值检测系统，支持深度比较和变更通知
//
// 脏值检测：
// - 检测数据是否发生变化
// - 支持深度对象比较
// - 支持数组变化检测
// - 提供变更通知机制

// 请实现 DirtyChecker 类
class DirtyChecker {
  constructor() {
    // 在这里写你的实现
    // 提示：需要存储原始数据、当前数据、监听器
    this.data = null;
    this.listeners = [];
  }

  // 设置数据并开始监听
  setData(data) {
    // 在这里写你的实现
    const oldData = this.data;
    this.data = this.deepClone(data);

    if (oldData !== null) {
      const changes = this.detectChanges(oldData, data);
      if (changes.length > 0) {
        this.notifyListeners(changes);
      }
    }

    return this;
  }

  // 检测数据变化
  detectChanges(oldData, newData) {
    // 在这里写你的实现
    // 返回变化的路径数组
    const changes = [];
    this.compareObjects(oldData, newData, '', changes);
    return changes;
  }

  // 深度比较对象
  compareObjects(oldObj, newObj, path, changes) {
    // 在这里写你的实现
    // 比较两个对象的差异，记录变化路径
  }

  // 添加变化监听器
  onChange(callback) {
    // 在这里写你的实现
    this.listeners.push(callback);
    return this;
  }

  // 移除监听器
  removeChangeListener(callback) {
    // 在这里写你的实现
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
    return this;
  }

  // 通知所有监听器
  notifyListeners(changes) {
    // 在这里写你的实现
    this.listeners.forEach(callback => {
      try {
        callback(changes);
      } catch (error) {
        console.error('监听器执行出错:', error);
      }
    });
  }

  // 获取当前数据
  getData() {
    // 在这里写你的实现
    return this.deepClone(this.data);
  }

  // 深度克隆
  deepClone(obj) {
    // 在这里写你的实现
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }

    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  }
}

// 请实现支持数组特殊检测的 DirtyChecker
class ArrayDirtyChecker extends DirtyChecker {
  compareObjects(oldObj, newObj, path, changes) {
    // 在这里写你的实现
    // 需要特殊处理数组的增删改操作
  }
}

// 测试用例
// ===============

console.log('=== 基础脏值检测测试 ===');

const checker = new DirtyChecker();

// 监听数据变化
checker.onChange((changes) => {
  console.log('检测到变化:', changes);
});

// 设置初始数据
checker.setData({
  name: 'Alice',
  age: 25,
  address: {
    city: 'Beijing',
    country: 'China'
  }
});

console.log('初始数据:', checker.getData());

// 修改数据
console.log('\n修改年龄:');
checker.setData({
  name: 'Alice',
  age: 26, // 年龄变化
  address: {
    city: 'Beijing',
    country: 'China'
  }
});

console.log('\n修改嵌套对象:');
checker.setData({
  name: 'Alice',
  age: 26,
  address: {
    city: 'Shanghai', // 城市变化
    country: 'China'
  }
});

console.log('\n添加新属性:');
checker.setData({
  name: 'Alice',
  age: 26,
  address: {
    city: 'Shanghai',
    country: 'China'
  },
  email: 'alice@example.com' // 新增属性
});

console.log('\n=== 数组变化检测测试 ===');

const arrayChecker = new ArrayDirtyChecker();

arrayChecker.onChange((changes) => {
  console.log('数组变化:', changes);
});

// 测试数组变化
const initialData = {
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ],
  tags: ['frontend', 'javascript']
};

arrayChecker.setData(initialData);

console.log('修改数组元素:');
arrayChecker.setData({
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Robert' } // Bob 改为 Robert
  ],
  tags: ['frontend', 'javascript']
});

console.log('\n添加数组元素:');
arrayChecker.setData({
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' } // 新增用户
  ],
  tags: ['frontend', 'javascript']
});

console.log('\n删除数组元素:');
arrayChecker.setData({
  users: [
    { id: 1, name: 'Alice' }
    // 删除了 Bob
  ],
  tags: ['frontend', 'javascript']
});

console.log('\n=== 复杂数据结构测试 ===');

const complexChecker = new DirtyChecker();

complexChecker.onChange((changes) => {
  console.log('复杂变化:', changes);
  changes.forEach(change => {
    console.log(`路径: ${change.path}, 类型: ${change.type}, 旧值: ${change.oldValue}, 新值: ${change.newValue}`);
  });
});

const complexData = {
  app: {
    user: {
      profile: {
        name: 'John',
        preferences: {
          theme: 'dark',
          notifications: true
        }
      }
    }
  },
  meta: {
    version: '1.0.0',
    lastModified: new Date('2023-01-01')
  }
};

complexChecker.setData(complexData);

console.log('\n深度嵌套变化:');
complexChecker.setData({
  app: {
    user: {
      profile: {
        name: 'John',
        preferences: {
          theme: 'light', // dark -> light
          notifications: true
        }
      }
    }
  },
  meta: {
    version: '1.0.0',
    lastModified: new Date('2023-01-01')
  }
});

console.log('\n=== 实际应用：表单状态管理 ===');

class FormManager {
  constructor(initialData) {
    this.checker = new DirtyChecker();
    this.originalData = this.checker.deepClone(initialData);
    this.isDirty = false;

    this.checker.onChange((changes) => {
      this.isDirty = true;
      console.log('表单已修改，变化:', changes);
    });

    this.checker.setData(initialData);
  }

  updateData(newData) {
    this.checker.setData(newData);
  }

  reset() {
    this.isDirty = false;
    this.checker.setData(this.originalData);
    return this.originalData;
  }

  getChanges() {
    return this.checker.detectChanges(this.originalData, this.checker.getData());
  }
}

// 模拟用户注册表单
const formData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  profile: {
    firstName: '',
    lastName: '',
    age: '',
    address: {
      street: '',
      city: '',
      zipCode: ''
    }
  },
  preferences: {
    newsletter: true,
    notifications: false
  }
};

const formManager = new FormManager(formData);

console.log('用户填写表单...');

formManager.updateData({
  username: 'alice2023',
  email: '',
  password: '',
  confirmPassword: '',
  profile: {
    firstName: '',
    lastName: '',
    age: '',
    address: {
      street: '',
      city: '',
      zipCode: ''
    }
  },
  preferences: {
    newsletter: true,
    notifications: false
  }
});

formManager.updateData({
  username: 'alice2023',
  email: 'alice@example.com',
  password: '',
  confirmPassword: '',
  profile: {
    firstName: 'Alice',
    lastName: '',
    age: '',
    address: {
      street: '',
      city: '',
      zipCode: ''
    }
  },
  preferences: {
    newsletter: false, // 取消订阅
    notifications: false
  }
});

console.log('\n表单是否脏数据:', formManager.isDirty);
console.log('表单变化:', formManager.getChanges());

console.log('\n重置表单...');
formManager.reset();
console.log('重置后是否脏数据:', formManager.isDirty);

console.log('\n=== 性能测试 ===');

// 创建大型数据进行性能测试
function createLargeData(size) {
  const data = {
    users: [],
    metadata: {
      total: size,
      timestamp: Date.now()
    }
  };

  for (let i = 0; i < size; i++) {
    data.users.push({
      id: i,
      name: `User${i}`,
      email: `user${i}@example.com`,
      profile: {
        age: 20 + (i % 50),
        department: `Dept${i % 10}`,
        skills: [`skill${i % 5}`, `skill${(i + 1) % 5}`]
      }
    });
  }

  return data;
}

const performanceChecker = new DirtyChecker();

performanceChecker.onChange((changes) => {
  console.log(`检测到 ${changes.length} 个变化`);
});

console.log('创建大数据集 (1000 条记录)...');
const largeData = createLargeData(1000);

console.time('初次设置数据');
performanceChecker.setData(largeData);
console.timeEnd('初次设置数据');

// 修改少量数据
console.time('检测小量变化');
const modifiedData = JSON.parse(JSON.stringify(largeData));
modifiedData.users[0].name = 'Modified User';
modifiedData.users[500].profile.age = 30;
performanceChecker.setData(modifiedData);
console.timeEnd('检测小量变化');

console.log('\n=== 边界情况测试 ===');

const edgeChecker = new DirtyChecker();

// 测试 null 和 undefined
console.log('null/undefined 测试:');
edgeChecker.setData(null);
edgeChecker.setData(undefined);
edgeChecker.setData({ key: 'value' });

// 测试循环引用（如果有实现）
console.log('\n循环引用测试:');
const obj = { name: 'test' };
obj.self = obj;
try {
  edgeChecker.setData(obj);
  console.log('循环引用处理成功');
} catch (error) {
  console.log('循环引用处理失败:', error.message);
}

// 测试特殊对象
console.log('\n特殊对象测试:');
const specialData = {
  date: new Date('2023-01-01'),
  regex: /test/gi,
  func: function() { return 'hello'; },
  symbol: Symbol('test')
};

edgeChecker.setData(specialData);
console.log('特殊对象处理完成');

console.log('\n=== 实际应用：状态管理器 ===');

class StateManager {
  constructor(initialState) {
    this.checker = new DirtyChecker();
    this.state = this.checker.deepClone(initialState);
    this.subscribers = [];

    this.checker.onChange((changes) => {
      this.state = this.checker.getData();
      this.notifySubscribers(changes);
    });

    this.checker.setData(initialState);
  }

  setState(updates) {
    const newState = { ...this.state, ...updates };
    this.checker.setData(newState);
  }

  getState() {
    return this.checker.getData();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  notifySubscribers(changes) {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state, changes);
      } catch (error) {
        console.error('订阅者回调出错:', error);
      }
    });
  }
}

// 使用状态管理器
const store = new StateManager({
  count: 0,
  user: null,
  loading: false
});

const unsubscribe = store.subscribe((state, changes) => {
  console.log('状态更新:', state);
  console.log('变化详情:', changes);
});

console.log('更新状态...');
store.setState({ count: 1 });
store.setState({ user: { name: 'Alice' } });
store.setState({ loading: true, count: 2 });

unsubscribe();
console.log('取消订阅后的状态更新（不会触发回调）:');
store.setState({ count: 3 });

/*
参考答案：

class DirtyChecker {
  constructor() {
    this.data = null;
    this.listeners = [];
  }

  setData(data) {
    const oldData = this.data;
    this.data = this.deepClone(data);

    if (oldData !== null) {
      const changes = this.detectChanges(oldData, data);
      if (changes.length > 0) {
        this.notifyListeners(changes);
      }
    }

    return this;
  }

  detectChanges(oldData, newData) {
    const changes = [];
    this.compareObjects(oldData, newData, '', changes);
    return changes;
  }

  compareObjects(oldObj, newObj, path, changes) {
    // 类型不同
    if (typeof oldObj !== typeof newObj) {
      changes.push({
        path,
        type: 'TYPE_CHANGE',
        oldValue: oldObj,
        newValue: newObj
      });
      return;
    }

    // 基本类型直接比较
    if (oldObj === null || typeof oldObj !== 'object') {
      if (oldObj !== newObj) {
        changes.push({
          path,
          type: 'VALUE_CHANGE',
          oldValue: oldObj,
          newValue: newObj
        });
      }
      return;
    }

    // 数组比较
    if (Array.isArray(oldObj) && Array.isArray(newObj)) {
      if (oldObj.length !== newObj.length) {
        changes.push({
          path,
          type: 'ARRAY_LENGTH_CHANGE',
          oldValue: oldObj.length,
          newValue: newObj.length
        });
      }

      const minLength = Math.min(oldObj.length, newObj.length);
      for (let i = 0; i < minLength; i++) {
        this.compareObjects(
          oldObj[i],
          newObj[i],
          path ? `${path}[${i}]` : `[${i}]`,
          changes
        );
      }
      return;
    }

    // 对象比较
    const oldKeys = Object.keys(oldObj);
    const newKeys = Object.keys(newObj);
    const allKeys = new Set([...oldKeys, ...newKeys]);

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;

      if (!(key in oldObj)) {
        // 新增属性
        changes.push({
          path: currentPath,
          type: 'PROPERTY_ADDED',
          oldValue: undefined,
          newValue: newObj[key]
        });
      } else if (!(key in newObj)) {
        // 删除属性
        changes.push({
          path: currentPath,
          type: 'PROPERTY_DELETED',
          oldValue: oldObj[key],
          newValue: undefined
        });
      } else {
        // 比较属性值
        this.compareObjects(oldObj[key], newObj[key], currentPath, changes);
      }
    }
  }

  onChange(callback) {
    this.listeners.push(callback);
    return this;
  }

  removeChangeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
    return this;
  }

  notifyListeners(changes) {
    this.listeners.forEach(callback => {
      try {
        callback(changes);
      } catch (error) {
        console.error('监听器执行出错:', error);
      }
    });
  }

  getData() {
    return this.deepClone(this.data);
  }

  deepClone(obj, visited = new WeakMap()) {
    // 处理循环引用
    if (visited.has(obj)) {
      return visited.get(obj);
    }

    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      const cloned = new Date(obj.getTime());
      visited.set(obj, cloned);
      return cloned;
    }

    if (obj instanceof RegExp) {
      const cloned = new RegExp(obj.source, obj.flags);
      visited.set(obj, cloned);
      return cloned;
    }

    if (Array.isArray(obj)) {
      const cloned = [];
      visited.set(obj, cloned);
      for (let i = 0; i < obj.length; i++) {
        cloned[i] = this.deepClone(obj[i], visited);
      }
      return cloned;
    }

    const cloned = {};
    visited.set(obj, cloned);

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key], visited);
      }
    }

    return cloned;
  }
}

// 数组增强版本
class ArrayDirtyChecker extends DirtyChecker {
  compareObjects(oldObj, newObj, path, changes) {
    // 数组特殊处理
    if (Array.isArray(oldObj) && Array.isArray(newObj)) {
      this.compareArrays(oldObj, newObj, path, changes);
      return;
    }

    // 其他情况使用父类方法
    super.compareObjects(oldObj, newObj, path, changes);
  }

  compareArrays(oldArr, newArr, path, changes) {
    if (oldArr.length !== newArr.length) {
      changes.push({
        path,
        type: 'ARRAY_LENGTH_CHANGE',
        oldValue: oldArr.length,
        newValue: newArr.length
      });
    }

    // 检测数组元素的增删改
    const minLength = Math.min(oldArr.length, newArr.length);

    // 比较现有元素
    for (let i = 0; i < minLength; i++) {
      this.compareObjects(
        oldArr[i],
        newArr[i],
        path ? `${path}[${i}]` : `[${i}]`,
        changes
      );
    }

    // 检测新增的元素
    for (let i = minLength; i < newArr.length; i++) {
      changes.push({
        path: path ? `${path}[${i}]` : `[${i}]`,
        type: 'ARRAY_ITEM_ADDED',
        oldValue: undefined,
        newValue: newArr[i]
      });
    }

    // 检测删除的元素
    for (let i = minLength; i < oldArr.length; i++) {
      changes.push({
        path: path ? `${path}[${i}]` : `[${i}]`,
        type: 'ARRAY_ITEM_REMOVED',
        oldValue: oldArr[i],
        newValue: undefined
      });
    }
  }
}

// 简化版本（不考虑复杂类型）：
class SimpleDirtyChecker {
  constructor() {
    this.data = null;
    this.listeners = [];
  }

  setData(data) {
    if (this.data && !this.deepEqual(this.data, data)) {
      this.notifyListeners();
    }
    this.data = JSON.parse(JSON.stringify(data));
  }

  deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb());
  }

  getData() {
    return JSON.parse(JSON.stringify(this.data));
  }
}
*/