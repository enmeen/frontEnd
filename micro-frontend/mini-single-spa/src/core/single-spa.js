/**
 * Mini Single-SPA - 简化版微前端框架
 * 核心功能：应用注册、状态管理、生命周期调度
 */

// 应用状态常量
export const AppStatus = {
  NOT_LOADED: 'NOT_LOADED',
  LOADING: 'LOADING',
  NOT_MOUNTED: 'NOT_MOUNTED',
  MOUNTING: 'MOUNTING',
  MOUNTED: 'MOUNTED',
  UNMOUNTING: 'UNMOUNTING',
  UNLOADING: 'UNLOADING',
  SKIP_BECAUSE_BROKEN: 'SKIP_BECAUSE_BROKEN'
};

// 应用注册表
const apps = [];

// 事件监听器
const eventListeners = new Map();

/**
 * 注册微应用
 * @param {string} name - 应用名称
 * @param {Function|Promise} loadingFunction - 应用加载函数
 * @param {Function} activeWhen - 激活条件函数
 * @param {Object} customProps - 自定义属性
 */
export function registerApplication(name, loadingFunction, activeWhen, customProps = {}) {
  if (!name || typeof name !== 'string') {
    throw new Error('应用名称必须是非空字符串');
  }

  if (typeof loadingFunction !== 'function') {
    throw new Error('加载函数必须是函数');
  }

  if (typeof activeWhen !== 'function') {
    throw new Error('激活条件函数必须是函数');
  }

  // 检查是否已注册同名应用
  if (apps.find(app => app.name === name)) {
    throw new Error(`应用 "${name}" 已经注册`);
  }

  const application = {
    name,
    loadingFunction,
    activeWhen,
    customProps,
    status: AppStatus.NOT_LOADED,
    app: null, // 加载后的应用实例
    loadPromise: null,
    mountPromise: null,
    unmountPromise: null
  };

  apps.push(application);

  console.log(`[Mini Single-SPA] 应用 "${name}" 注册成功`);

  // 触发应用注册事件
  emitEvent('application-registered', { name, application });

  return application;
}

/**
 * 获取所有注册的应用
 */
export function getApplications() {
  return [...apps];
}

/**
 * 根据名称获取应用
 */
export function getApplicationByName(name) {
  return apps.find(app => app.name === name);
}

/**
 * 启动微前端框架
 */
export function start() {
  console.log('[Mini Single-SPA] 框架启动');

  // 监听路由变化
  window.addEventListener('popstate', handleRouteChange);
  window.addEventListener('hashchange', handleRouteChange);

  // 初始检查
  checkAndStartApplications();

  // 触发框架启动事件
  emitEvent('started');
}

/**
 * 路由变化处理
 */
function handleRouteChange() {
  console.log('[Mini Single-SPA] 路由变化，重新检查应用');
  checkAndStartApplications();
}

/**
 * 检查并启动/停止应用
 */
async function checkAndStartApplications() {
  const activeApps = apps.filter(app => app.activeWhen());
  const inactiveApps = apps.filter(app => !app.activeWhen());

  // 处理需要激活的应用
  for (const app of activeApps) {
    try {
      await ensureAppIsLoaded(app);
      await ensureAppIsMounted(app);
    } catch (error) {
      console.error(`[Mini Single-SPA] 应用 "${app.name}" 激活失败:`, error);
      app.status = AppStatus.SKIP_BECAUSE_BROKEN;
    }
  }

  // 处理需要停用的应用
  for (const app of inactiveApps) {
    try {
      await ensureAppIsUnmounted(app);
    } catch (error) {
      console.error(`[Mini Single-SPA] 应用 "${app.name}" 停用失败:`, error);
      app.status = AppStatus.SKIP_BECAUSE_BROKEN;
    }
  }
}

/**
 * 确保应用已加载
 */
async function ensureAppIsLoaded(app) {
  if (app.status === AppStatus.NOT_LOADED) {
    app.status = AppStatus.LOADING;
    emitEvent('application-loading', { name: app.name });

    try {
      app.loadPromise = app.loadingFunction();
      const loadedApp = await app.loadPromise;

      // 验证加载的应用
      if (!isValidApp(loadedApp)) {
        throw new Error('加载的应用不符合规范');
      }

      app.app = loadedApp;
      app.status = AppStatus.NOT_MOUNTED;

      console.log(`[Mini Single-SPA] 应用 "${app.name}" 加载成功`);
      emitEvent('application-loaded', { name: app.name, app: loadedApp });

    } catch (error) {
      app.status = AppStatus.SKIP_BECAUSE_BROKEN;
      throw error;
    }
  }
}

/**
 * 确保应用已挂载
 */
async function ensureAppIsMounted(app) {
  if (app.status === AppStatus.NOT_MOUNTED) {
    app.status = AppStatus.MOUNTING;
    emitEvent('application-mounting', { name: app.name });

    try {
      // 如果应用有 bootstrap 生命周期，先执行
      if (app.app.bootstrap && typeof app.app.bootstrap === 'function') {
        await app.app.bootstrap(app.customProps);
      }

      // 执行 mount 生命周期
      app.mountPromise = app.app.mount(app.customProps);
      await app.mountPromise;

      app.status = AppStatus.MOUNTED;

      console.log(`[Mini Single-SPA] 应用 "${app.name}" 挂载成功`);
      emitEvent('application-mounted', { name: app.name });

    } catch (error) {
      app.status = AppStatus.SKIP_BECAUSE_BROKEN;
      throw error;
    }
  }
}

/**
 * 确保应用已卸载
 */
async function ensureAppIsUnmounted(app) {
  if (app.status === AppStatus.MOUNTED) {
    app.status = AppStatus.UNMOUNTING;
    emitEvent('application-unmounting', { name: app.name });

    try {
      // 执行 unmount 生命周期
      app.unmountPromise = app.app.unmount(app.customProps);
      await app.unmountPromise;

      app.status = AppStatus.NOT_MOUNTED;

      console.log(`[Mini Single-SPA] 应用 "${app.name}" 卸载成功`);
      emitEvent('application-unmounted', { name: app.name });

    } catch (error) {
      app.status = AppStatus.SKIP_BECAUSE_BROKEN;
      throw error;
    }
  }
}

/**
 * 验证应用是否符合规范
 */
function isValidApp(app) {
  return app &&
         typeof app === 'object' &&
         typeof app.mount === 'function' &&
         typeof app.unmount === 'function';
}

/**
 * 事件系统
 */
export function on(eventName, listener) {
  if (!eventListeners.has(eventName)) {
    eventListeners.set(eventName, []);
  }
  eventListeners.get(eventName).push(listener);
}

export function off(eventName, listener) {
  if (eventListeners.has(eventName)) {
    const listeners = eventListeners.get(eventName);
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
}

function emitEvent(eventName, payload = {}) {
  if (eventListeners.has(eventName)) {
    eventListeners.get(eventName).forEach(listener => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`[Mini Single-SPA] 事件监听器执行失败 (${eventName}):`, error);
      }
    });
  }
}

/**
 * 获取应用状态
 */
export function getAppStatus(name) {
  const app = getApplicationByName(name);
  return app ? app.status : null;
}

/**
 * 手动触发路由检查
 */
export function triggerRouteCheck() {
  checkAndStartApplications();
}

/**
 * 重置框架（主要用于测试）
 */
export function reset() {
  apps.length = 0;
  eventListeners.clear();
  console.log('[Mini Single-SPA] 框架已重置');
}