/**
 * Mini Single-SPA DOM 工具函数
 * 提供常用的DOM操作和管理功能
 */

/**
 * 安全地查询DOM元素
 * @param {string} selector - CSS选择器
 * @param {Element} parent - 父元素，默认为document
 * @returns {Element|null}
 */
export function querySelector(selector, parent = document) {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    console.warn(`[DOM] 无效的选择器: ${selector}`, error);
    return null;
  }
}

/**
 * 安全地查询多个DOM元素
 * @param {string} selector - CSS选择器
 * @param {Element} parent - 父元素，默认为document
 * @returns {NodeList}
 */
export function querySelectorAll(selector, parent = document) {
  try {
    return parent.querySelectorAll(selector);
  } catch (error) {
    console.warn(`[DOM] 无效的选择器: ${selector}`, error);
    return [];
  }
}

/**
 * 创建DOM元素
 * @param {string} tagName - 标签名
 * @param {Object} attributes - 属性对象
 * @param {string|Element|Array} children - 子元素
 * @returns {Element}
 */
export function createElement(tagName, attributes = {}, children = []) {
  const element = document.createElement(tagName);

  // 设置属性
  Object.keys(attributes).forEach(key => {
    if (key === 'className') {
      element.className = attributes[key];
    } else if (key === 'style' && typeof attributes[key] === 'object') {
      Object.assign(element.style, attributes[key]);
    } else if (key.startsWith('on') && typeof attributes[key] === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), attributes[key]);
    } else if (key === 'dataset' && typeof attributes[key] === 'object') {
      Object.assign(element.dataset, attributes[key]);
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });

  // 添加子元素
  if (typeof children === 'string') {
    element.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Element) {
        element.appendChild(child);
      }
    });
  } else if (children instanceof Element) {
    element.appendChild(children);
  }

  return element;
}

/**
 * 安全地移除DOM元素
 * @param {Element} element - 要移除的元素
 */
export function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
    return true;
  }
  return false;
}

/**
 * 清空元素内容
 * @param {Element} element - 要清空的元素
 */
export function emptyElement(element) {
  if (element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
}

/**
 * 检查元素是否存在
 * @param {Element|string} element - 元素或选择器
 * @returns {boolean}
 */
export function elementExists(element) {
  if (typeof element === 'string') {
    return !!querySelector(element);
  }
  return element && element.parentNode;
}

/**
 * 等待元素出现
 * @param {string} selector - CSS选择器
 * @param {number} timeout - 超时时间（毫秒）
 * @param {Element} parent - 父元素
 * @returns {Promise<Element>}
 */
export function waitForElement(selector, timeout = 5000, parent = document) {
  return new Promise((resolve, reject) => {
    const element = querySelector(selector, parent);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      const element = querySelector(selector, parent);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });

    observer.observe(parent, {
      childList: true,
      subtree: true
    });

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`等待元素超时: ${selector}`));
    }, timeout);
  });
}

/**
 * 添加CSS样式
 * @param {string} styles - CSS样式字符串
 * @param {string} id - 样式ID，用于后续移除
 */
export function addStyles(styles, id) {
  // 检查是否已存在相同样式
  if (id) {
    const existingStyle = querySelector(`style[data-id="${id}"]`);
    if (existingStyle) {
      return existingStyle;
    }
  }

  const styleElement = createElement('style', {
    type: 'text/css',
    ...(id && { 'data-id': id })
  }, styles);

  document.head.appendChild(styleElement);
  return styleElement;
}

/**
 * 移除CSS样式
 * @param {string} id - 样式ID
 */
export function removeStyles(id) {
  const styleElement = querySelector(`style[data-id="${id}"]`);
  if (styleElement) {
    removeElement(styleElement);
    return true;
  }
  return false;
}

/**
 * 创建微应用容器
 * @param {string} appName - 应用名称
 * @param {Object} options - 容器选项
 * @returns {Element}
 */
export function createAppContainer(appName, options = {}) {
  const {
    id = `app-container-${appName}`,
    className = `micro-app-container`,
    style = {
      display: 'block',
      width: '100%',
      height: '100%'
    }
  } = options;

  // 检查是否已存在容器
  let container = querySelector(`#${id}`);
  if (container) {
    emptyElement(container);
    return container;
  }

  // 创建新容器
  container = createElement('div', {
    id,
    className,
    style,
    'data-app-name': appName
  });

  // 添加到body
  document.body.appendChild(container);

  console.log(`[DOM] 创建应用容器: ${id}`);
  return container;
}

/**
 * 获取应用容器
 * @param {string} appName - 应用名称
 * @returns {Element|null}
 */
export function getAppContainer(appName) {
  return querySelector(`#app-container-${appName}`);
}

/**
 * 移除应用容器
 * @param {string} appName - 应用名称
 * @returns {boolean}
 */
export function removeAppContainer(appName) {
  const container = getAppContainer(appName);
  if (container) {
    removeElement(container);
    console.log(`[DOM] 移除应用容器: app-container-${appName}`);
    return true;
  }
  return false;
}

/**
 * 检查元素是否在视口内
 * @param {Element} element - 要检查的元素
 * @returns {boolean}
 */
export function isInViewport(element) {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 滚动元素到视口
 * @param {Element} element - 要滚动到的元素
 * @param {Object} options - 滚动选项
 */
export function scrollToElement(element, options = {}) {
  if (!element) return;

  const {
    behavior = 'smooth',
    block = 'start',
    inline = 'nearest'
  } = options;

  element.scrollIntoView({
    behavior,
    block,
    inline
  });
}

/**
 * 获取元素的计算样式
 * @param {Element} element - 目标元素
 * @param {string} property - CSS属性名
 * @returns {string}
 */
export function getComputedStyle(element, property) {
  if (!element) return '';

  const styles = window.getComputedStyle(element);
  return property ? styles[property] : styles;
}

/**
 * 设置元素样式
 * @param {Element} element - 目标元素
 * @param {Object|string} styles - 样式对象或属性名
 * @param {string} value - 样式值（当styles是字符串时）
 */
export function setElementStyle(element, styles, value) {
  if (!element) return;

  if (typeof styles === 'string') {
    element.style[styles] = value;
  } else if (typeof styles === 'object') {
    Object.assign(element.style, styles);
  }
}

/**
 * 添加CSS类
 * @param {Element} element - 目标元素
 * @param {...string} classNames - 类名
 */
export function addClass(element, ...classNames) {
  if (element && element.classList) {
    element.classList.add(...classNames);
  }
}

/**
 * 移除CSS类
 * @param {Element} element - 目标元素
 * @param {...string} classNames - 类名
 */
export function removeClass(element, ...classNames) {
  if (element && element.classList) {
    element.classList.remove(...classNames);
  }
}

/**
 * 切换CSS类
 * @param {Element} element - 目标元素
 * @param {string} className - 类名
 * @returns {boolean}
 */
export function toggleClass(element, className) {
  if (element && element.classList) {
    return element.classList.toggle(className);
  }
  return false;
}

/**
 * 检查是否包含CSS类
 * @param {Element} element - 目标元素
 * @param {string} className - 类名
 * @returns {boolean}
 */
export function hasClass(element, className) {
  return element && element.classList && element.classList.contains(className);
}

/**
 * 事件委托
 * @param {Element} parent - 父元素
 * @param {string} selector - 子元素选择器
 * @param {string} event - 事件类型
 * @param {Function} handler - 事件处理函数
 */
export function delegate(parent, selector, event, handler) {
  if (!parent) return;

  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, e);
    }
  });
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function}
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function}
 */
export function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}