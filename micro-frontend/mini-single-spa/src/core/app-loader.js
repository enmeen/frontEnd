/**
 * Mini Single-SPA 应用加载器
 * 负责动态加载、沙箱隔离和应用管理
 */

// 加载状态跟踪
const loadState = new Map();

// 全局变量备份（用于沙箱恢复）
const originalGlobalVars = {};

/**
 * 加载配置选项
 */
const DEFAULT_LOAD_CONFIG = {
  timeout: 10000,        // 加载超时时间（毫秒）
  retryCount: 3,         // 重试次数
  retryDelay: 1000,      // 重试延迟（毫秒）
  enableSandbox: true,   // 是否启用沙箱
  clearCache: false      // 是否清除缓存
};

/**
 * 加载微应用
 * @param {string|Function|Object} appConfig - 应用配置
 * @param {Object} options - 加载选项
 */
export async function loadApp(appConfig, options = {}) {
  const config = { ...DEFAULT_LOAD_CONFIG, ...options };

  // 生成应用ID（用于缓存和跟踪）
  const appId = generateAppId(appConfig);

  // 检查缓存
  if (!config.clearCache && loadState.has(appId)) {
    const cachedApp = loadState.get(appId);
    if (cachedApp.status === 'loaded') {
      console.log(`[AppLoader] 从缓存加载应用: ${appId}`);
      return cachedApp.app;
    }
  }

  console.log(`[AppLoader] 开始加载应用: ${appId}`);

  try {
    // 更新加载状态
    updateLoadState(appId, 'loading');

    let loadedApp;

    if (typeof appConfig === 'string') {
      // URL字符串加载
      loadedApp = await loadFromUrl(appConfig, config);
    } else if (typeof appConfig === 'function') {
      // 函数加载
      loadedApp = await loadFromFunction(appConfig, config);
    } else if (typeof appConfig === 'object' && appConfig !== null) {
      // 配置对象加载
      loadedApp = await loadFromConfig(appConfig, config);
    } else {
      throw new Error(`不支持的应用配置类型: ${typeof appConfig}`);
    }

    // 验证加载的应用
    validateLoadedApp(loadedApp);

    // 包装应用（添加沙箱支持等）
    const wrappedApp = wrapApplication(loadedApp, config);

    // 缓存加载的应用
    updateLoadState(appId, 'loaded', wrappedApp);

    console.log(`[AppLoader] 应用加载成功: ${appId}`);
    return wrappedApp;

  } catch (error) {
    updateLoadState(appId, 'error', null, error);
    console.error(`[AppLoader] 应用加载失败: ${appId}`, error);
    throw error;
  }
}

/**
 * 从URL加载应用
 */
async function loadFromUrl(url, config) {
  console.log(`[AppLoader] 从URL加载: ${url}`);

  let attempt = 0;
  let lastError;

  while (attempt < config.retryCount) {
    try {
      const response = await fetchWithTimeout(url, config.timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const scriptContent = await response.text();

      // 在沙箱中执行脚本
      return executeInSandbox(scriptContent, url, config);

    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt < config.retryCount) {
        console.warn(`[AppLoader] 加载失败，${config.retryDelay}ms后重试 (${attempt}/${config.retryCount}):`, error.message);
        await delay(config.retryDelay);
      }
    }
  }

  throw lastError;
}

/**
 * 从函数加载应用
 */
async function loadFromFunction(loadFunction, config) {
  console.log(`[AppLoader] 从函数加载应用`);

  if (config.enableSandbox) {
    return executeInSandbox(loadFunction, 'function', config);
  } else {
    return await loadFunction();
  }
}

/**
 * 从配置对象加载应用
 */
async function loadFromConfig(appConfig, config) {
  console.log(`[AppLoader] 从配置对象加载应用`);

  if (appConfig.url) {
    return await loadFromUrl(appConfig.url, { ...config, ...appConfig });
  } else if (appConfig.loader) {
    return await loadFromFunction(appConfig.loader, config);
  } else {
    throw new Error('配置对象必须包含 url 或 loader 属性');
  }
}

/**
 * 在沙箱中执行代码
 */
function executeInSandbox(code, source, config) {
  if (!config.enableSandbox) {
    // 非沙箱模式直接执行
    if (typeof code === 'function') {
      return code();
    } else {
      // 创建一个函数并执行
      const appFunction = new Function('return ' + code);
      return appFunction();
    }
  }

  console.log(`[AppLoader] 在沙箱中执行: ${source}`);

  // 创建沙箱环境
  const sandbox = createSandbox();

  try {
    let result;

    if (typeof code === 'function') {
      // 在沙箱上下文中执行函数
      result = code.call(sandbox.global, sandbox.global);
    } else {
      // 创建沙箱化的函数并执行
      const sandboxedFunction = new Function(
        ...Object.keys(sandbox.global),
        `return (${code})`
      );
      result = sandboxedFunction(...Object.values(sandbox.global));
    }

    // 处理异步结果
    if (result && typeof result.then === 'function') {
      return result.then(app => {
        sandbox.cleanup();
        return app;
      }).catch(error => {
        sandbox.cleanup();
        throw error;
      });
    } else {
      sandbox.cleanup();
      return result;
    }

  } catch (error) {
    sandbox.cleanup();
    throw error;
  }
}

/**
 * 创建沙箱环境
 */
function createSandbox() {
  const sandbox = {
    global: {},
    originalVars: {},
    addedVars: new Set(),

    cleanup() {
      // 恢复原始全局变量
      Object.keys(this.originalVars).forEach(key => {
        window[key] = this.originalVars[key];
      });

      // 删除新增的全局变量
      this.addedVars.forEach(key => {
        delete window[key];
      });

      console.log('[AppLoader] 沙箱清理完成');
    }
  };

  // 备份当前全局变量
  const globalKeys = ['window', 'document', 'console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'];

  globalKeys.forEach(key => {
    if (typeof window[key] !== 'undefined') {
      sandbox.originalVars[key] = window[key];
    }
  });

  // 创建代理对象作为沙箱的全局环境
  sandbox.global = new Proxy(window, {
    get(target, prop) {
      const value = target[prop];

      // 如果是函数，绑定到正确的作用域
      if (typeof value === 'function' && globalKeys.includes(prop)) {
        return value.bind(target);
      }

      return value;
    },

    set(target, prop, value) {
      // 跟踪新增的变量
      if (!(prop in target)) {
        sandbox.addedVars.add(prop);
      } else if (!sandbox.originalVars.hasOwnProperty(prop)) {
        // 备份原有变量
        sandbox.originalVars[prop] = target[prop];
      }

      target[prop] = value;
      return true;
    }
  });

  return sandbox;
}

/**
 * 包装应用（添加生命周期钩子等）
 */
function wrapApplication(app, config) {
  const wrappedApp = { ...app };

  // 包装生命周期方法
  ['bootstrap', 'mount', 'unmount'].forEach(lifecycle => {
    if (wrappedApp[lifecycle]) {
      const originalMethod = wrappedApp[lifecycle];
      wrappedApp[lifecycle] = async function(props) {
        console.log(`[AppLoader] 执行生命周期: ${lifecycle}`);
        try {
          const result = await originalMethod.call(this, props);
          console.log(`[AppLoader] 生命周期完成: ${lifecycle}`);
          return result;
        } catch (error) {
          console.error(`[AppLoader] 生命周期失败: ${lifecycle}`, error);
          throw error;
        }
      };
    }
  });

  return wrappedApp;
}

/**
 * 验证加载的应用
 */
function validateLoadedApp(app) {
  if (!app || typeof app !== 'object') {
    throw new Error('加载的应用必须是对象');
  }

  if (typeof app.mount !== 'function') {
    throw new Error('应用必须实现 mount 方法');
  }

  if (typeof app.unmount !== 'function') {
    throw new Error('应用必须实现 unmount 方法');
  }

  // 可选的生命周期方法
  ['bootstrap'].forEach(method => {
    if (app[method] && typeof app[method] !== 'function') {
      throw new Error(`如果存在 ${method} 方法，它必须是函数`);
    }
  });

  return true;
}

/**
 * 生成应用ID
 */
function generateAppId(appConfig) {
  if (typeof appConfig === 'string') {
    return `url_${btoa(appConfig).slice(0, 8)}`;
  } else if (typeof appConfig === 'function') {
    return `func_${appConfig.name || 'anonymous'}_${Date.now()}`;
  } else if (appConfig.name) {
    return appConfig.name;
  } else {
    return `app_${Math.random().toString(36).slice(2, 9)}`;
  }
}

/**
 * 更新加载状态
 */
function updateLoadState(appId, status, app = null, error = null) {
  loadState.set(appId, {
    appId,
    status,
    app,
    error,
    timestamp: Date.now()
  });
}

/**
 * 带超时的fetch
 */
function fetchWithTimeout(url, timeout) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`加载超时: ${timeout}ms`)), timeout);
    })
  ]);
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 获取加载状态
 */
export function getLoadState(appId) {
  return loadState.get(appId);
}

/**
 * 获取所有加载状态
 */
export function getAllLoadStates() {
  return new Map(loadState);
}

/**
 * 清除加载缓存
 */
export function clearLoadCache(appId = null) {
  if (appId) {
    loadState.delete(appId);
    console.log(`[AppLoader] 清除应用缓存: ${appId}`);
  } else {
    loadState.clear();
    console.log(`[AppLoader] 清除所有应用缓存`);
  }
}

/**
 * 预加载应用
 */
export async function preloadApp(appConfig, options = {}) {
  console.log(`[AppLoader] 预加载应用`);
  try {
    await loadApp(appConfig, { ...options, preload: true });
  } catch (error) {
    console.warn(`[AppLoader] 预加载失败:`, error);
  }
}