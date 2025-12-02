/**
 * Mini Single-SPA 日志工具
 * 提供统一的日志记录和管理功能
 */

// 日志级别
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4
};

// 默认配置
const DEFAULT_CONFIG = {
  level: LogLevel.INFO,
  prefix: '[Mini Single-SPA]',
  enableConsole: true,
  enableStorage: false,
  maxStorageSize: 1000,
  timestamp: true,
  colors: true
};

// 当前配置
let config = { ...DEFAULT_CONFIG };

// 内存中的日志记录
let logHistory = [];

// 控制台样式（彩色输出）
const consoleStyles = {
  [LogLevel.DEBUG]: 'color: #6c757d; font-weight: normal;',
  [LogLevel.INFO]: 'color: #007bff; font-weight: normal;',
  [LogLevel.WARN]: 'color: #ffc107; font-weight: bold;',
  [LogLevel.ERROR]: 'color: #dc3545; font-weight: bold;'
};

// 日志级别名称
const levelNames = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR'
};

/**
 * 配置日志器
 * @param {Object} newConfig - 新配置
 */
export function configureLogger(newConfig) {
  config = { ...config, ...newConfig };

  // 如果启用了存储，尝试从localStorage恢复日志
  if (config.enableStorage && typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('mini-single-spa-logs');
      if (stored) {
        logHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[Logger] 从localStorage恢复日志失败:', error);
    }
  }

  console.log('[Logger] 日志器配置已更新:', config);
}

/**
 * 获取当前配置
 */
export function getLoggerConfig() {
  return { ...config };
}

/**
 * 核心日志函数
 * @param {number} level - 日志级别
 * @param {string} message - 日志消息
 * @param {any} data - 附加数据
 */
function log(level, message, data = null) {
  // 检查日志级别
  if (level < config.level) {
    return;
  }

  const timestamp = config.timestamp ? new Date().toISOString() : '';
  const prefix = config.prefix ? `${config.prefix} ` : '';
  const levelName = levelNames[level];

  // 创建日志记录
  const logEntry = {
    level,
    levelName,
    message,
    data,
    timestamp,
    url: typeof window !== 'undefined' ? window.location.href : ''
  };

  // 添加到历史记录
  logHistory.push(logEntry);

  // 限制历史记录大小
  if (logHistory.length > config.maxStorageSize) {
    logHistory.shift();
  }

  // 存储到localStorage
  if (config.enableStorage && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('mini-single-spa-logs', JSON.stringify(logHistory));
    } catch (error) {
      // 忽略存储错误
    }
  }

  // 输出到控制台
  if (config.enableConsole && typeof console !== 'undefined') {
    let logMessage = timestamp ? `${timestamp} ${prefix}${levelName}: ${message}` : `${prefix}${levelName}: ${message}`;

    // 根据级别选择console方法
    const consoleMethod = level >= LogLevel.ERROR ? 'error' :
                         level === LogLevel.WARN ? 'warn' :
                         level === LogLevel.INFO ? 'info' : 'log';

    // 彩色输出
    if (config.colors && consoleStyles[level]) {
      console[consoleMethod](`%c${logMessage}`, consoleStyles[level], data || '');
    } else {
      console[consoleMethod](logMessage, data || '');
    }
  }
}

/**
 * Debug级别日志
 * @param {string} message - 日志消息
 * @param {any} data - 附加数据
 */
export function debug(message, data) {
  log(LogLevel.DEBUG, message, data);
}

/**
 * Info级别日志
 * @param {string} message - 日志消息
 * @param {any} data - 附加数据
 */
export function info(message, data) {
  log(LogLevel.INFO, message, data);
}

/**
 * Warn级别日志
 * @param {string} message - 日志消息
 * @param {any} data - 附加数据
 */
export function warn(message, data) {
  log(LogLevel.WARN, message, data);
}

/**
 * Error级别日志
 * @param {string} message - 日志消息
 * @param {any} data - 附加数据
 */
export function error(message, data) {
  log(LogLevel.ERROR, message, data);
}

/**
 * 应用专用日志
 * @param {string} appName - 应用名称
 * @param {number} level - 日志级别
 * @param {string} message - 日志消息
 * @param {any} data - 附加数据
 */
export function logApp(appName, level, message, data) {
  const appMessage = `[${appName}] ${message}`;
  log(level, appMessage, data);
}

/**
 * 生命周期专用日志
 * @param {string} appName - 应用名称
 * @param {string} phase - 生命周期阶段
 * @param {string} message - 日志消息
 * @param {any} data - 附加数据
 */
export function logLifecycle(appName, phase, message, data) {
  const lifecycleMessage = `[${appName}:${phase}] ${message}`;
  log(LogLevel.INFO, lifecycleMessage, data);
}

/**
 * 路由专用日志
 * @param {string} message - 日志消息
 * @param {any} data - 附加数据
 */
export function logRoute(message, data) {
  log(LogLevel.INFO, `[Route] ${message}`, data);
}

/**
 * 获取日志历史
 * @param {Object} filters - 过滤条件
 * @returns {Array}
 */
export function getLogHistory(filters = {}) {
  let filteredLogs = [...logHistory];

  // 按级别过滤
  if (filters.level !== undefined) {
    filteredLogs = filteredLogs.filter(log => log.level === filters.level);
  }

  // 按应用过滤
  if (filters.app) {
    filteredLogs = filteredLogs.filter(log =>
      log.message.includes(`[${filters.app}]`)
    );
  }

  // 按时间范围过滤
  if (filters.since) {
    const since = new Date(filters.since).getTime();
    filteredLogs = filteredLogs.filter(log =>
      new Date(log.timestamp).getTime() >= since
    );
  }

  if (filters.until) {
    const until = new Date(filters.until).getTime();
    filteredLogs = filteredLogs.filter(log =>
      new Date(log.timestamp).getTime() <= until
    );
  }

  // 按关键词过滤
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    filteredLogs = filteredLogs.filter(log =>
      log.message.toLowerCase().includes(keyword)
    );
  }

  // 限制数量
  if (filters.limit) {
    filteredLogs = filteredLogs.slice(-filters.limit);
  }

  return filteredLogs;
}

/**
 * 清除日志历史
 */
export function clearLogHistory() {
  logHistory = [];

  if (config.enableStorage && typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('mini-single-spa-logs');
    } catch (error) {
      console.warn('[Logger] 清除存储日志失败:', error);
    }
  }

  info('日志历史已清除');
}

/**
 * 导出日志
 * @param {string} format - 导出格式 ('json' | 'csv' | 'txt')
 * @returns {string}
 */
export function exportLogs(format = 'json') {
  const logs = getLogHistory();

  switch (format.toLowerCase()) {
    case 'csv':
      return exportLogsAsCsv(logs);
    case 'txt':
      return exportLogsAsTxt(logs);
    case 'json':
    default:
      return JSON.stringify(logs, null, 2);
  }
}

/**
 * 导出为CSV格式
 */
function exportLogsAsCsv(logs) {
  const headers = ['timestamp', 'level', 'message', 'data'];
  const csvContent = [
    headers.join(','),
    ...logs.map(log => [
      `"${log.timestamp}"`,
      `"${log.levelName}"`,
      `"${log.message.replace(/"/g, '""')}"`,
      `"${JSON.stringify(log.data || {}).replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');

  return csvContent;
}

/**
 * 导出为文本格式
 */
function exportLogsAsTxt(logs) {
  return logs.map(log => {
    const dataStr = log.data ? `\n  Data: ${JSON.stringify(log.data, null, 2)}` : '';
    return `[${log.timestamp}] ${log.levelName}: ${log.message}${dataStr}`;
  }).join('\n\n');
}

/**
 * 获取日志统计信息
 */
export function getLogStats() {
  const stats = {
    total: logHistory.length,
    byLevel: {},
    byApp: {},
    recentErrors: []
  };

  // 按级别统计
  Object.values(LogLevel).forEach(level => {
    if (typeof level === 'number') {
      stats.byLevel[levelNames[level]] = logHistory.filter(log => log.level === level).length;
    }
  });

  // 按应用统计（简单的消息解析）
  const appCounts = {};
  logHistory.forEach(log => {
    const appMatch = log.message.match(/^\[([^\]]+)\]/);
    if (appMatch) {
      const appName = appMatch[1];
      appCounts[appName] = (appCounts[appName] || 0) + 1;
    }
  });
  stats.byApp = appCounts;

  // 最近的错误
  stats.recentErrors = logHistory
    .filter(log => log.level === LogLevel.ERROR)
    .slice(-5)
    .map(log => ({
      timestamp: log.timestamp,
      message: log.message,
      data: log.data
    }));

  return stats;
}

/**
 * 创建子日志器
 * @param {string} component - 组件名称
 * @returns {Object}
 */
export function createChildLogger(component) {
  return {
    debug: (message, data) => log(LogLevel.DEBUG, `[${component}] ${message}`, data),
    info: (message, data) => log(LogLevel.INFO, `[${component}] ${message}`, data),
    warn: (message, data) => log(LogLevel.WARN, `[${component}] ${message}`, data),
    error: (message, data) => log(LogLevel.ERROR, `[${component}] ${message}`, data),
    log: (level, message, data) => log(level, `[${component}] ${message}`, data)
  };
}

/**
 * 性能日志
 * @param {string} operation - 操作名称
 * @param {Function} fn - 要测量的函数
 * @param {any} args - 函数参数
 */
export async function logPerformance(operation, fn, ...args) {
  const startTime = performance.now();

  try {
    const result = await fn(...args);
    const duration = Math.round(performance.now() - startTime);

    log(LogLevel.INFO, `[Performance] ${operation} 完成`, {
      duration: `${duration}ms`,
      success: true
    });

    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);

    log(LogLevel.ERROR, `[Performance] ${operation} 失败`, {
      duration: `${duration}ms`,
      success: false,
      error: error.message
    });

    throw error;
  }
}

// 初始化默认配置
configureLogger({});