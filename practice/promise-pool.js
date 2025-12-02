// 手写 Promise 题目
// ===================
//
// 要求：实现一个支持并发控制的 PromisePool
//
// PromisePool：
// - 控制同时执行的 Promise 数量
// - 支持动态添加任务
// - 支持错误处理
// - 支持获取执行状态

// 请实现 PromisePool 类
class PromisePool {
  constructor(maxConcurrency = 3) {
    this.maxConcurrency = maxConcurrency;
    this.running = 0;
    this.queue = [];
    this.results = [];
    this.errors = [];
    this.isStarted = false;
    this.taskIndex = 0; // 独立的任务索引计数器
  }

  // 添加任务到队列
  add(task) {
    // 在这里写你的实现
    if (typeof task !== 'function') {
      throw new Error('任务必须是返回 Promise 的函数');
    }
    console.log('添加任务，当前队列长度:', this.queue.length + 1);
    // 存入任务和顺序索引
    this.queue.push({ task, index: this.taskIndex });
    this.taskIndex++; // 递增索引

    // 如果已经启动，尝试立即执行
    if (this.isStarted) {
      this.processQueue();
    }

    return this; // 支持链式调用
  }

  processQueue() {
    while (this.running < this.maxConcurrency && this.queue.length > 0) {
      const {task, index} = this.queue.shift();
      this.executeTask(task, index);
    }
  }

  async executeTask(task, index) {
    this.running++;

    try {
      const result = await task();
      this.results[index] = { result, success: true };

    } catch (error) {
      this.results[index] = { error: error.message, success: false };
      console.error(`任务执行失败:`, error.message);
    } finally {
      this.running--;
      this.processQueue(); // 处理队列中的下一个任务
      this.checkCompletion(); // ✅ 事件驱动：每个任务完成后立即检查
    }
  }


  // 开始执行所有任务
  async start() {
    return new Promise((resolve) => {
        // 重要设计，保存 resolve 函数，使得能够在函数之外调用
        this.resolvePromise = resolve; // 保存 resolve 函数
        this.isStarted = true;
        this.processQueue();
        this.checkCompletion(); // 立即检查是否已完成
    })
  }

  // 检查是否所有任务完成（事件驱动）
  checkCompletion() {
    if (this.running === 0 && this.queue.length === 0 && this.resolvePromise) {
      this.resolvePromise({
        results: this.results,
        errors: this.errors,
        total: this.taskIndex
      });
      this.resolvePromise = null; // 清理 resolve 函数
    }else{
      console.log('当前状态：运行中:', this.running, '队列长度:', this.queue.length);
    }
  }

  // 获取执行状态
  getStatus() {
    // 在这里写你的实现
    return this.isStarted
  }

  // 清空队列
  clear() {
    // 在这里写你的实现
    this.queue = [];
    this.taskIndex = 0;
    return this;
  }
}

// 测试用例
// ===============

console.log('=== 基础并发控制测试 ===');

// 模拟异步任务
function createTask(name, delay) {
  return async () => {
    console.log(`任务 ${name} 开始执行`);
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log(`任务 ${name} 完成`);
    return `${name} 的结果`;
  };
}

const pool = new PromisePool(2); // 最大并发数为 2

// 添加任务
pool.add(createTask('A', 1000));
pool.add(createTask('B', 800));
pool.add(createTask('C', 600));
pool.add(createTask('D', 400));
pool.add(createTask('E', 200));

console.log('初始状态:', pool.getStatus());

// 开始执行
pool.start().then(results => {
  console.log('所有任务完成，结果:', results);
});


console.log('\n=== 错误处理测试 ===');

setTimeout(() => {
  const errorPool = new PromisePool(2);

  // 添加会出错的任务
  errorPool.add(async () => {
    console.log('错误任务1开始');
    throw new Error('任务1失败了');
  });

  errorPool.add(async () => {
    console.log('正常任务2开始');
    await new Promise(resolve => setTimeout(resolve, 100));
    return '任务2成功';
  });

  errorPool.add(async () => {
    console.log('正常任务3开始');
    await new Promise(resolve => setTimeout(resolve, 150));
    return '任务3成功';
  });

  errorPool.start().then(results => {
    console.log('错误池结果:', results);
    console.log('错误池错误:', errorPool.errors);
  });
}, 4000);

console.log('\n=== 动态添加任务测试 ===');

setTimeout(() => {
  const dynamicPool = new PromisePool(1);

  // 先添加一个任务
  dynamicPool.add(createTask('初始任务', 500));
  dynamicPool.start();

  // 在执行过程中添加新任务
  setTimeout(() => {
    console.log('动态添加新任务');
    dynamicPool.add(createTask('动态任务1', 300));
    dynamicPool.add(createTask('动态任务2', 200));
  }, 200);

  // 再次动态添加
  setTimeout(() => {
    console.log('再次动态添加任务');
    dynamicPool.add(createTask('动态任务3', 100));
  }, 600);
}, 8000);

console.log('\n=== 实际应用：图片批量上传 ===');

setTimeout(() => {
  class ImageUploader {
    constructor(maxConcurrency = 2) {
      this.pool = new PromisePool(maxConcurrency);
      this.uploadProgress = 0;
    }

    uploadImage(imageInfo) {
      return this.pool.add(async () => {
        console.log(`开始上传: ${imageInfo.name}`);

        // 模拟上传进度
        for (let i = 0; i <= 100; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 50));
          console.log(`上传进度 ${imageInfo.name}: ${i}%`);
        }

        // 随机模拟失败
        if (Math.random() < 0.2) {
          throw new Error(`上传失败: ${imageInfo.name}`);
        }

        console.log(`上传完成: ${imageInfo.name}`);
        this.uploadProgress++;
        return {
          name: imageInfo.name,
          url: `https://cdn.example.com/${imageInfo.name}`,
          size: imageInfo.size
        };
      });
    }

    uploadAll(images) {
      images.forEach(img => this.uploadImage(img));
      return this.pool.start();
    }

    getUploadStatus() {
      const status = this.pool.getStatus();
      return {
        ...status,
        uploadProgress: this.uploadProgress,
        totalImages: status.pending + status.running + this.uploadProgress
      };
    }
  }

  const uploader = new ImageUploader(3);
  const images = [
    { name: 'avatar.jpg', size: 1024 },
    { name: 'background.png', size: 2048 },
    { name: 'logo.svg', size: 512 },
    { name: 'banner.jpg', size: 4096 },
    { name: 'icon.png', size: 256 }
  ];

  uploader.uploadAll(images).then(results => {
    console.log('所有图片上传完成:', results);
    console.log('上传错误:', uploader.pool.errors);
  });

  // 监控上传状态
  const uploadInterval = setInterval(() => {
    console.log('上传状态:', uploader.getUploadStatus());
  }, 200);

  setTimeout(() => clearInterval(uploadInterval), 5000);
}, 12000);

/*
参考答案：

class PromisePool {
  constructor(maxConcurrency = 3) {
    this.maxConcurrency = maxConcurrency;
    this.running = 0;
    this.queue = [];
    this.results = [];
    this.errors = [];
    this.isStarted = false;
    this.completing = false;
  }

  add(task) {
    if (typeof task !== 'function') {
      throw new Error('任务必须是返回 Promise 的函数');
    }

    this.queue.push({
      task,
      id: Date.now() + Math.random()
    });

    // 如果已经启动，尝试立即执行
    if (this.isStarted) {
      this.processQueue();
    }

    return this; // 支持链式调用
  }

  async start() {
    this.isStarted = true;
    this.processQueue();

    // 等待所有任务完成
    return new Promise((resolve) => {
      const checkComplete = () => {
        if (this.running === 0 && this.queue.length === 0) {
          resolve({
            results: this.results,
            errors: this.errors,
            total: this.results.length + this.errors.length
          });
        } else {
          setTimeout(checkComplete, 10);
        }
      };
      checkComplete();
    });
  }

  processQueue() {
    while (this.running < this.maxConcurrency && this.queue.length > 0) {
      const { task, id } = this.queue.shift();
      this.executeTask(task, id);
    }
  }

  async executeTask(task, id) {
    this.running++;

    try {
      const result = await task();
      this.results.push({ id, result, success: true });
    } catch (error) {
      this.errors.push({ id, error: error.message, success: false });
      console.error(`任务执行失败:`, error.message);
    } finally {
      this.running--;
      this.processQueue(); // 处理队列中的下一个任务
    }
  }

  getStatus() {
    return {
      running: this.running,
      pending: this.queue.length,
      completed: this.results.length,
      errors: this.errors.length,
      maxConcurrency: this.maxConcurrency
    };
  }

  clear() {
    // 只清空未执行的任务，不影响正在执行的任务
    this.queue = [];
    return this;
  }
}

// 更简洁的实现：
class SimplePromisePool {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.running = 0;
    this.tasks = [];
  }

  add(promiseFn) {
    this.tasks.push(promiseFn);
    return this;
  }

  async start() {
    const results = [];

    const worker = async () => {
      while (this.tasks.length > 0) {
        const task = this.tasks.shift();
        this.running++;

        try {
          const result = await task();
          results.push(result);
        } catch (error) {
          results.push({ error: error.message });
        } finally {
          this.running--;
        }
      }
    };

    const workers = Array(Math.min(this.concurrency, this.tasks.length))
      .fill().map(() => worker());

    await Promise.all(workers);
    return results;
  }
}
*/