/**
 * Mini Single-SPA 生命周期管理
 * 提供应用生命周期的管理和执行功能
 */

// 生命周期阶段常量
export const LifecyclePhases = {
  BOOTSTRAP: 'bootstrap',
  MOUNT: 'mount',
  UNMOUNT: 'unmount',
  UPDATE: 'update'
};

// 生命周期状态
export const LifecycleStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error'
};

// 生命周期钩子注册表
const globalHooks = {
  [LifecyclePhases.BOOTSTRAP]: [],
  [LifecyclePhases.MOUNT]: [],
  [LifecyclePhases.UNMOUNT]: [],
  [LifecyclePhases.UPDATE]: []
};

// 生命周期执行历史
const executionHistory = [];

/**
 * 生命周期执行结果
 */
class LifecycleResult {
  constructor(phase, appName, status, duration = 0, error = null) {
    this.phase = phase;
    this.appName = appName;
    this.status = status;
    this.duration = duration;
    this.error = error;
    this.timestamp = Date.now();
  }

  isSuccess() {
    return this.status === LifecycleStatus.SUCCESS;
  }

  isError() {
    return this.status === LifecycleStatus.ERROR;
  }
}

/**
 * 执行应用生命周期
 * @param {Object} app - 应用对象
 * @param {string} phase - 生命周期阶段
 * @param {Object} props - 传递给应用的属性
 */
export async function executeLifecycle(app, phase, props = {}) {
  if (!app || !app.name) {
    throw new Error('无效的应用对象');
  }

  const startTime = Date.now();
  const appName = app.name;

  console.log(`[Lifecycle] 开始执行 ${phase} 阶段: ${appName}`);

  try {
    // 更新状态为运行中
    updateAppLifecycleStatus(app, phase, LifecycleStatus.RUNNING);

    // 执行全局前置钩子
    await executeGlobalHooks(phase, 'before', { app, phase, props });

    // 执行应用的生命周期方法
    let result;
    if (app[phase] && typeof app[phase] === 'function') {
      console.log(`[Lifecycle] 执行应用 ${appName} 的 ${phase} 方法`);
      result = await app[phase](props);
    } else {
      console.log(`[Lifecycle] 应用 ${appName} 没有实现 ${phase} 方法，跳过`);
      result = null;
    }

    // 执行全局后置钩子
    await executeGlobalHooks(phase, 'after', { app, phase, props, result });

    const duration = Date.now() - startTime;
    const lifecycleResult = new LifecycleResult(phase, appName, LifecycleStatus.SUCCESS, duration);

    // 记录成功结果
    recordExecution(lifecycleResult);
    updateAppLifecycleStatus(app, phase, LifecycleStatus.SUCCESS);

    console.log(`[Lifecycle] ${phase} 阶段执行成功: ${appName} (${duration}ms)`);
    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    const lifecycleResult = new LifecycleResult(phase, appName, LifecycleStatus.ERROR, duration, error);

    // 记录错误结果
    recordExecution(lifecycleResult);
    updateAppLifecycleStatus(app, phase, LifecycleStatus.ERROR);

    console.error(`[Lifecycle] ${phase} 阶段执行失败: ${appName} (${duration}ms)`, error);

    // 执行错误钩子
    try {
      await executeGlobalHooks(phase, 'error', { app, phase, props, error });
    } catch (hookError) {
      console.error('[Lifecycle] 错误钩子执行失败:', hookError);
    }

    throw error;
  }
}

/**
 * 批量执行多个应用的生命周期
 * @param {Array} apps - 应用数组
 * @param {string} phase - 生命周期阶段
 * @param {Object} props - 传递给应用的属性
 * @param {Object} options - 执行选项
 */
export async function executeBatchLifecycle(apps, phase, props = {}, options = {}) {
  const {
    parallel = true,    // 是否并行执行
    stopOnError = true, // 遇到错误是否停止
    timeout = 10000     // 超时时间
  } = options;

  console.log(`[Lifecycle] 批量执行 ${phase} 阶段 (${parallel ? '并行' : '串行'}): ${apps.map(app => app.name).join(', ')}`);

  const results = [];

  if (parallel) {
    // 并行执行
    const promises = apps.map(app =>
      executeLifecycleWithTimeout(app, phase, props, timeout)
        .then(result => ({ app, result, error: null }))
        .catch(error => ({ app, result: null, error }))
    );

    const promiseResults = await Promise.all(promises);

    for (const { app, result, error } of promiseResults) {
      if (error) {
        results.push({ app, success: false, error });
        if (stopOnError) {
          throw new Error(`批量执行失败，应用 ${app.name} 在 ${phase} 阶段出错: ${error.message}`);
        }
      } else {
        results.push({ app, success: true, result });
      }
    }
  } else {
    // 串行执行
    for (const app of apps) {
      try {
        const result = await executeLifecycleWithTimeout(app, phase, props, timeout);
        results.push({ app, success: true, result });
      } catch (error) {
        results.push({ app, success: false, error });
        if (stopOnError) {
          throw new Error(`批量执行失败，应用 ${app.name} 在 ${phase} 阶段出错: ${error.message}`);
        }
      }
    }
  }

  return results;
}

/**
 * 带超时的生命周期执行
 */
function executeLifecycleWithTimeout(app, phase, props, timeout) {
  return Promise.race([
    executeLifecycle(app, phase, props),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`生命周期 ${phase} 执行超时 (${timeout}ms): ${app.name}`));
      }, timeout);
    })
  ]);
}

/**
 * 注册全局生命周期钩子
 * @param {string} phase - 生命周期阶段
 * @param {string} when - 'before' | 'after' | 'error'
 * @param {Function} hook - 钩子函数
 */
export function registerLifecycleHook(phase, when, hook) {
  if (!globalHooks[phase]) {
    throw new Error(`不支持的生命周期阶段: ${phase}`);
  }

  if (!['before', 'after', 'error'].includes(when)) {
    throw new Error('钩子时机必须是 before、after 或 error');
  }

  if (typeof hook !== 'function') {
    throw new Error('钩子必须是函数');
  }

  const hookKey = `${phase}_${when}`;
  if (!globalHooks[hookKey]) {
    globalHooks[hookKey] = [];
  }

  globalHooks[hookKey].push({
    id: generateHookId(),
    phase,
    when,
    hook
  });

  console.log(`[Lifecycle] 注册钩子: ${phase}_${when}`);
}

/**
 * 移除生命周期钩子
 * @param {string} phase - 生命周期阶段
 * @param {string} when - 钩子时机
 * @param {string|Function} hook - 钩子ID或函数
 */
export function removeLifecycleHook(phase, when, hook) {
  const hookKey = `${phase}_${when}`;
  const hooks = globalHooks[hookKey];

  if (!hooks) return false;

  const index = hooks.findIndex(h =>
    (typeof hook === 'string' && h.id === hook) ||
    (typeof hook === 'function' && h.hook === hook)
  );

  if (index > -1) {
    hooks.splice(index, 1);
    console.log(`[Lifecycle] 移除钩子: ${phase}_${when}`);
    return true;
  }

  return false;
}

/**
 * 执行全局钩子
 */
async function executeGlobalHooks(phase, when, context) {
  const hookKey = `${phase}_${when}`;
  const hooks = globalHooks[hookKey];

  if (!hooks || hooks.length === 0) {
    return;
  }

  console.log(`[Lifecycle] 执行 ${hookKey} 钩子 (${hooks.length} 个)`);

  for (const { hook } of hooks) {
    try {
      await hook(context);
    } catch (error) {
      console.error(`[Lifecycle] 钩子执行失败 (${hookKey}):`, error);
      // 钩子错误不应该影响主流程
    }
  }
}

/**
 * 更新应用生命周期状态
 */
function updateAppLifecycleStatus(app, phase, status) {
  if (!app.lifecycleStatus) {
    app.lifecycleStatus = {};
  }

  app.lifecycleStatus[phase] = {
    status,
    timestamp: Date.now()
  };
}

/**
 * 记录执行历史
 */
function recordExecution(result) {
  executionHistory.push(result);

  // 限制历史记录数量
  if (executionHistory.length > 100) {
    executionHistory.shift();
  }
}

/**
 * 获取执行历史
 */
export function getExecutionHistory(phase = null, appName = null, limit = 10) {
  let history = [...executionHistory];

  if (phase) {
    history = history.filter(record => record.phase === phase);
  }

  if (appName) {
    history = history.filter(record => record.appName === appName);
  }

  // 按时间倒序排列
  history.sort((a, b) => b.timestamp - a.timestamp);

  return history.slice(0, limit);
}

/**
 * 获取应用当前生命周期状态
 */
export function getAppLifecycleStatus(app) {
  return app.lifecycleStatus || {};
}

/**
 * 清除执行历史
 */
export function clearExecutionHistory() {
  executionHistory.length = 0;
  console.log('[Lifecycle] 执行历史已清除');
}

/**
 * 清除所有全局钩子
 */
export function clearGlobalHooks() {
  Object.keys(globalHooks).forEach(key => {
    if (Array.isArray(globalHooks[key])) {
      globalHooks[key].length = 0;
    }
  });
  console.log('[Lifecycle] 所有全局钩子已清除');
}

/**
 * 生成钩子ID
 */
function generateHookId() {
  return `hook_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 获取性能统计信息
 */
export function getLifecycleStats() {
  const stats = {
    totalExecutions: executionHistory.length,
    successCount: executionHistory.filter(r => r.isSuccess()).length,
    errorCount: executionHistory.filter(r => r.isError()).length,
    averageDuration: 0,
    phaseStats: {},
    recentErrors: []
  };

  if (executionHistory.length > 0) {
    const totalDuration = executionHistory.reduce((sum, r) => sum + r.duration, 0);
    stats.averageDuration = Math.round(totalDuration / executionHistory.length);

    // 按阶段统计
    Object.values(LifecyclePhases).forEach(phase => {
      const phaseRecords = executionHistory.filter(r => r.phase === phase);
      stats.phaseStats[phase] = {
        count: phaseRecords.length,
        successCount: phaseRecords.filter(r => r.isSuccess()).length,
        errorCount: phaseRecords.filter(r => r.isError()).length,
        averageDuration: phaseRecords.length > 0
          ? Math.round(phaseRecords.reduce((sum, r) => sum + r.duration, 0) / phaseRecords.length)
          : 0
      };
    });

    // 最近错误
    stats.recentErrors = executionHistory
      .filter(r => r.isError())
      .slice(-5)
      .map(r => ({
        appName: r.appName,
        phase: r.phase,
        error: r.error?.message || 'Unknown error',
        timestamp: r.timestamp
      }));
  }

  return stats;
}

/**
 * 初始化生命周期管理器
 */
export function initLifecycle() {
  // 注册默认的错误处理钩子
  registerLifecycleHook(LifecyclePhases.BOOTSTRAP, 'error', (context) => {
    console.error('[Lifecycle] Bootstrap 失败:', context.error);
  });

  registerLifecycleHook(LifecyclePhases.MOUNT, 'error', (context) => {
    console.error('[Lifecycle] Mount 失败:', context.error);
  });

  registerLifecycleHook(LifecyclePhases.UNMOUNT, 'error', (context) => {
    console.error('[Lifecycle] Unmount 失败:', context.error);
  });

  console.log('[Lifecycle] 生命周期管理器初始化完成');
}