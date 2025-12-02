/**
 * 示例微应用 App1
 * 这是一个简单的计数器应用
 */

// 应用配置
const appConfig = {
  name: 'app1',
  version: '1.0.0',
  description: '示例计数器应用'
};

// 应用状态
let state = {
  count: 0,
  isMounted: false
};

// DOM 元素引用
let container = null;
let countElement = null;
let incrementBtn = null;
let decrementBtn = null;
let resetBtn = null;

/**
 * Bootstrap 生命周期
 * 初始化应用，准备挂载
 */
export async function bootstrap(props = {}) {
  console.log('[App1] Bootstrap 阶段开始', props);

  // 可以在这里进行一些初始化工作
  // 比如：加载配置、建立连接等

  // 模拟异步初始化
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('[App1] Bootstrap 阶段完成');
}

/**
 * Mount 生命周期
 * 挂载应用到DOM
 */
export async function mount(props = {}) {
  console.log('[App1] Mount 阶段开始', props);

  if (state.isMounted) {
    console.warn('[App1] 应用已经挂载');
    return;
  }

  try {
    // 创建或获取容器
    container = createAppContainer();

    // 渲染应用UI
    renderApp();

    // 绑定事件
    bindEvents();

    // 更新状态
    state.isMounted = true;

    console.log('[App1] Mount 阶段完成');
  } catch (error) {
    console.error('[App1] Mount 阶段失败:', error);
    throw error;
  }
}

/**
 * Unmount 生命周期
 * 从DOM卸载应用
 */
export async function unmount(props = {}) {
  console.log('[App1] Unmount 阶段开始', props);

  if (!state.isMounted) {
    console.warn('[App1] 应用未挂载');
    return;
  }

  try {
    // 解绑事件
    unbindEvents();

    // 清理DOM
    if (container) {
      container.innerHTML = '';
    }

    // 重置状态
    state = {
      count: 0,
      isMounted: false
    };

    // 清理DOM引用
    container = null;
    countElement = null;
    incrementBtn = null;
    decrementBtn = null;
    resetBtn = null;

    console.log('[App1] Unmount 阶段完成');
  } catch (error) {
    console.error('[App1] Unmount 阶段失败:', error);
    throw error;
  }
}

/**
 * Update 生命周期（可选）
 * 当应用属性发生变化时调用
 */
export async function update(props = {}) {
  console.log('[App1] Update 阶段', props);

  // 可以根据新的props更新应用状态
  if (props.count !== undefined && typeof props.count === 'number') {
    state.count = props.count;
    updateCountDisplay();
  }
}

/**
 * 创建应用容器
 */
function createAppContainer() {
  let container = document.getElementById('app1-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'app1-container';
    container.className = 'micro-app';
    document.body.appendChild(container);
  }

  return container;
}

/**
 * 渲染应用UI
 */
function renderApp() {
  if (!container) return;

  container.innerHTML = `
    <div class="app1-wrapper" style="
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      max-width: 400px;
      margin: 20px auto;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    ">
      <h2 style="margin: 0 0 20px 0; font-size: 24px;">🎯 计数器应用 (App1)</h2>
      <p style="margin: 0 0 20px 0; opacity: 0.9;">这是一个简单的微前端示例应用</p>

      <div style="
        background: rgba(255,255,255,0.2);
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        backdrop-filter: blur(10px);
      ">
        <div style="font-size: 48px; font-weight: bold; margin: 20px 0;" id="count-display">
          ${state.count}
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button id="increment-btn" style="
            background: rgba(255,255,255,0.3);
            border: 2px solid white;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
          ">+1</button>

          <button id="decrement-btn" style="
            background: rgba(255,255,255,0.3);
            border: 2px solid white;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
          ">-1</button>

          <button id="reset-btn" style="
            background: rgba(255,255,255,0.1);
            border: 2px solid white;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
          ">重置</button>
        </div>
      </div>

      <div style="
        background: rgba(0,0,0,0.2);
        border-radius: 6px;
        padding: 15px;
        margin-top: 20px;
        font-size: 14px;
        text-align: left;
      ">
        <div><strong>应用名称:</strong> ${appConfig.name}</div>
        <div><strong>版本:</strong> ${appConfig.version}</div>
        <div><strong>状态:</strong> <span id="status">已挂载</span></div>
        <div><strong>挂载时间:</strong> <span id="mount-time">${new Date().toLocaleTimeString()}</span></div>
      </div>
    </div>
  `;

  // 获取DOM元素引用
  countElement = container.querySelector('#count-display');
  incrementBtn = container.querySelector('#increment-btn');
  decrementBtn = container.querySelector('#decrement-btn');
  resetBtn = container.querySelector('#reset-btn');

  // 添加按钮悬停效果
  [incrementBtn, decrementBtn, resetBtn].forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(255,255,255,0.4)';
      btn.style.transform = 'scale(1.05)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.background = btn === resetBtn ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)';
      btn.style.transform = 'scale(1)';
    });
  });
}

/**
 * 绑定事件监听器
 */
function bindEvents() {
  if (incrementBtn) {
    incrementBtn.addEventListener('click', handleIncrement);
  }

  if (decrementBtn) {
    decrementBtn.addEventListener('click', handleDecrement);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', handleReset);
  }

  // 监听键盘事件
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * 解绑事件监听器
 */
function unbindEvents() {
  if (incrementBtn) {
    incrementBtn.removeEventListener('click', handleIncrement);
  }

  if (decrementBtn) {
    decrementBtn.removeEventListener('click', handleDecrement);
  }

  if (resetBtn) {
    resetBtn.removeEventListener('click', handleReset);
  }

  document.removeEventListener('keydown', handleKeyDown);
}

/**
 * 处理增加计数
 */
function handleIncrement() {
  state.count++;
  updateCountDisplay();
  console.log('[App1] 计数增加到:', state.count);
}

/**
 * 处理减少计数
 */
function handleDecrement() {
  state.count--;
  updateCountDisplay();
  console.log('[App1] 计数减少到:', state.count);
}

/**
 * 处理重置计数
 */
function handleReset() {
  state.count = 0;
  updateCountDisplay();
  console.log('[App1] 计数已重置');
}

/**
 * 更新计数显示
 */
function updateCountDisplay() {
  if (countElement) {
    countElement.textContent = state.count;

    // 添加动画效果
    countElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
      countElement.style.transform = 'scale(1)';
    }, 200);
  }
}

/**
 * 处理键盘事件
 */
function handleKeyDown(event) {
  if (!state.isMounted) return;

  switch (event.key) {
    case 'ArrowUp':
    case '+':
      event.preventDefault();
      handleIncrement();
      break;
    case 'ArrowDown':
    case '-':
      event.preventDefault();
      handleDecrement();
      break;
    case '0':
    case 'r':
    case 'R':
      event.preventDefault();
      handleReset();
      break;
  }
}

/**
 * 获取应用状态
 */
export function getAppState() {
  return { ...state };
}

/**
 * 获取应用配置
 */
export function getAppConfig() {
  return { ...appConfig };
}

/**
 * 发送应用消息（用于应用间通信）
 */
export function sendMessage(type, data) {
  const event = new CustomEvent('app1-message', {
    detail: { type, data, timestamp: Date.now() }
  });
  window.dispatchEvent(event);
}

/**
 * 监听来自其他应用的消息
 */
export function onMessage(callback) {
  window.addEventListener('app1-message', callback);
  return () => window.removeEventListener('app1-message', callback);
}

// 导出应用信息
console.log('[App1] 应用模块已加载', appConfig);