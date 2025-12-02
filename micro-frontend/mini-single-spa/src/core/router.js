/**
 * Mini Single-SPA 路由管理模块
 * 提供路由匹配、导航和事件处理功能
 */

// 路由配置
const routes = [];

// 当前路由状态
let currentRoute = null;

// 事件监听器
const routeListeners = [];

/**
 * 路由匹配规则类型
 */
export const RouteTypes = {
  HASH: 'hash',           // hash 路由: #/app1
  PATH: 'path',           // path 路由: /app1
  EXACT: 'exact',         // 精确匹配
  STARTS_WITH: 'startsWith',  // 前缀匹配
  REGEX: 'regex'          // 正则表达式匹配
};

/**
 * 添加路由规则
 * @param {Object} route - 路由配置
 * @param {string} route.path - 路径模式
 * @param {Function} route.matcher - 匹配函数或字符串
 * @param {string} route.type - 路由类型
 * @param {Object} route.meta - 元数据
 */
export function addRoute(route) {
  if (!route || !route.path) {
    throw new Error('路由配置必须包含 path 属性');
  }

  const normalizedRoute = {
    path: route.path,
    matcher: route.matcher || route.path,
    type: route.type || RouteTypes.PATH,
    meta: route.meta || {},
    ...route
  };

  routes.push(normalizedRoute);

  console.log(`[Router] 路由添加: ${normalizedRoute.path}`);
  return normalizedRoute;
}

/**
 * 获取当前路径
 */
export function getCurrentPath() {
  if (typeof window === 'undefined') {
    return '/';
  }

  const { pathname, hash } = window.location;

  // 如果有 hash，返回 hash 路径
  if (hash && hash.length > 1) {
    return hash.slice(1);
  }

  // 否则返回 pathname
  return pathname;
}

/**
 * 路径匹配函数
 * @param {string} path - 当前路径
 * @param {Object} route - 路由规则
 */
function matchPath(path, route) {
  const { matcher, type } = route;

  switch (type) {
    case RouteTypes.EXACT:
      return path === matcher;

    case RouteTypes.STARTS_WITH:
      return path.startsWith(matcher);

    case RouteTypes.REGEX:
      return matcher instanceof RegExp ? matcher.test(path) : false;

    case RouteTypes.HASH:
      // 对于 hash 路由，检查当前 hash 是否匹配
      const currentHash = window.location.hash.slice(1);
      return currentHash === matcher;

    case RouteTypes.PATH:
    default:
      // 默认前缀匹配
      return path.startsWith(matcher);
  }
}

/**
 * 获取匹配的路由
 * @param {string} path - 当前路径
 */
export function getMatchedRoutes(path = getCurrentPath()) {
  return routes.filter(route => matchPath(path, route));
}

/**
 * 导航到指定路径
 * @param {string} path - 目标路径
 * @param {Object} options - 导航选项
 */
export function navigateTo(path, options = {}) {
  if (typeof window === 'undefined') {
    console.warn('[Router] 在非浏览器环境中无法导航');
    return;
  }

  const { replace = false, state = {} } = options;

  // 处理 hash 导航
  if (path.startsWith('#')) {
    const hash = path;
    if (replace) {
      window.location.replace(hash);
    } else {
      window.location.hash = hash;
    }
    return;
  }

  // 处理 path 导航
  const url = new URL(path, window.location.origin);

  if (replace) {
    window.history.replaceState(state, '', url);
  } else {
    window.history.pushState(state, '', url);
  }

  // 触发路由变化事件
  handleRouteChange();
}

/**
 * 处理路由变化
 */
function handleRouteChange() {
  const currentPath = getCurrentPath();
  const matchedRoutes = getMatchedRoutes(currentPath);

  const newRoute = {
    path: currentPath,
    matchedRoutes,
    timestamp: Date.now()
  };

  // 检查路由是否真的发生了变化
  if (currentRoute && currentRoute.path === currentPath) {
    return;
  }

  const previousRoute = currentRoute;
  currentRoute = newRoute;

  console.log(`[Router] 路由变化: ${previousRoute?.path || '/'} -> ${currentPath}`);

  // 触发路由变化监听器
  routeListeners.forEach(listener => {
    try {
      listener(currentRoute, previousRoute);
    } catch (error) {
      console.error('[Router] 路由监听器执行失败:', error);
    }
  });
}

/**
 * 监听路由变化
 * @param {Function} listener - 监听器函数
 */
export function onRouteChange(listener) {
  if (typeof listener !== 'function') {
    throw new Error('路由监听器必须是函数');
  }

  routeListeners.push(listener);

  // 返回取消监听的函数
  return () => {
    const index = routeListeners.indexOf(listener);
    if (index > -1) {
      routeListeners.splice(index, 1);
    }
  };
}

/**
 * 创建路由激活函数
 * @param {string|Function} pathOrMatcher - 路径模式或匹配函数
 */
export function createActiveWhen(pathOrMatcher) {
  if (typeof pathOrMatcher === 'function') {
    return pathOrMatcher;
  }

  if (typeof pathOrMatcher === 'string') {
    return () => {
      const currentPath = getCurrentPath();
      return currentPath.startsWith(pathOrMatcher);
    };
  }

  if (pathOrMatcher instanceof RegExp) {
    return () => {
      const currentPath = getCurrentPath();
      return pathOrMatcher.test(currentPath);
    };
  }

  throw new Error('无效的路由匹配器');
}

/**
 * 解析路由参数
 * @param {string} path - 路径模式
 * @param {string} actualPath - 实际路径
 */
export function parseRouteParams(path, actualPath) {
  const pathParts = path.split('/').filter(Boolean);
  const actualParts = actualPath.split('/').filter(Boolean);

  const params = {};

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    if (part.startsWith(':')) {
      const paramName = part.slice(1);
      params[paramName] = actualParts[i] || '';
    }
  }

  return params;
}

/**
 * 获取当前路由信息
 */
export function getCurrentRoute() {
  return currentRoute;
}

/**
 * 获取所有路由配置
 */
export function getRoutes() {
  return [...routes];
}

/**
 * 清除所有路由配置
 */
export function clearRoutes() {
  routes.length = 0;
  console.log('[Router] 所有路由配置已清除');
}

/**
 * 初始化路由系统
 */
export function initRouter() {
  if (typeof window === 'undefined') {
    console.warn('[Router] 在非浏览器环境中跳过路由初始化');
    return;
  }

  // 监听浏览器导航事件
  window.addEventListener('popstate', handleRouteChange);
  window.addEventListener('hashchange', handleRouteChange);

  // 初始化当前路由
  handleRouteChange();

  console.log('[Router] 路由系统初始化完成');
}

/**
 * 销毁路由系统
 */
export function destroyRouter() {
  if (typeof window === 'undefined') {
    return;
  }

  window.removeEventListener('popstate', handleRouteChange);
  window.removeEventListener('hashchange', handleRouteChange);

  routeListeners.length = 0;
  routes.length = 0;
  currentRoute = null;

  console.log('[Router] 路由系统已销毁');
}

// 自动初始化（仅在浏览器环境中）
if (typeof window !== 'undefined') {
  initRouter();
}