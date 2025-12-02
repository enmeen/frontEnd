/**
 * 示例微应用 App2
 * 这是一个待办事项应用
 */

// 应用配置
const appConfig = {
  name: 'app2',
  version: '1.0.0',
  description: '示例待办事项应用'
};

// 应用状态
let state = {
  todos: [],
  nextId: 1,
  isMounted: false,
  filter: 'all' // all, active, completed
};

// DOM 元素引用
let container = null;
let todoList = null;
let todoInput = null;
let addBtn = null;
let filterBtns = null;

// 示例待办事项
const sampleTodos = [
  { id: 1, text: '学习微前端概念', completed: true },
  { id: 2, text: '实现 mini-single-spa 框架', completed: true },
  { id: 3, text: '创建示例应用', completed: false },
  { id: 4, text: '测试应用生命周期', completed: false }
];

/**
 * Bootstrap 生命周期
 * 初始化应用，准备挂载
 */
export async function bootstrap(props = {}) {
  console.log('[App2] Bootstrap 阶段开始', props);

  // 初始化待办事项数据
  state.todos = [...sampleTodos];
  state.nextId = Math.max(...state.todos.map(todo => todo.id)) + 1;

  // 模拟异步初始化
  await new Promise(resolve => setTimeout(resolve, 150));

  console.log('[App2] Bootstrap 阶段完成');
}

/**
 * Mount 生命周期
 * 挂载应用到DOM
 */
export async function mount(props = {}) {
  console.log('[App2] Mount 阶段开始', props);

  if (state.isMounted) {
    console.warn('[App2] 应用已经挂载');
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

    console.log('[App2] Mount 阶段完成');
  } catch (error) {
    console.error('[App2] Mount 阶段失败:', error);
    throw error;
  }
}

/**
 * Unmount 生命周期
 * 从DOM卸载应用
 */
export async function unmount(props = {}) {
  console.log('[App2] Unmount 阶段开始', props);

  if (!state.isMounted) {
    console.warn('[App2] 应用未挂载');
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
      todos: [],
      nextId: 1,
      isMounted: false,
      filter: 'all'
    };

    // 清理DOM引用
    container = null;
    todoList = null;
    todoInput = null;
    addBtn = null;
    filterBtns = null;

    console.log('[App2] Unmount 阶段完成');
  } catch (error) {
    console.error('[App2] Unmount 阶段失败:', error);
    throw error;
  }
}

/**
 * Update 生命周期（可选）
 * 当应用属性发生变化时调用
 */
export async function update(props = {}) {
  console.log('[App2] Update 阶段', props);

  // 可以根据新的props更新应用状态
  if (props.todos) {
    state.todos = props.todos;
    renderTodoList();
  }
}

/**
 * 创建应用容器
 */
function createAppContainer() {
  let container = document.getElementById('app2-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'app2-container';
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
    <div class="app2-wrapper" style="
      padding: 20px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border-radius: 8px;
      max-width: 500px;
      margin: 20px auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    ">
      <h2 style="margin: 0 0 20px 0; font-size: 24px;">📝 待办事项 (App2)</h2>
      <p style="margin: 0 0 20px 0; opacity: 0.9;">管理你的任务清单</p>

      <!-- 添加新任务 -->
      <div style="
        background: rgba(255,255,255,0.2);
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        display: flex;
        gap: 10px;
        backdrop-filter: blur(10px);
      ">
        <input
          type="text"
          id="todo-input"
          placeholder="输入新任务..."
          style="
            flex: 1;
            background: rgba(255,255,255,0.3);
            border: 2px solid rgba(255,255,255,0.5);
            color: white;
            padding: 10px 15px;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            transition: all 0.3s ease;
          "
          placeholder-style="color: rgba(255,255,255,0.7);"
        />
        <button
          id="add-btn"
          style="
            background: rgba(255,255,255,0.4);
            border: 2px solid white;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
          "
        >添加</button>
      </div>

      <!-- 过滤器 -->
      <div style="
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        justify-content: center;
      ">
        <button class="filter-btn" data-filter="all" style="
          background: ${state.filter === 'all' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'};
          border: 2px solid white;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        ">全部 (${state.todos.length})</button>
        <button class="filter-btn" data-filter="active" style="
          background: ${state.filter === 'active' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'};
          border: 2px solid white;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        ">进行中 (${getActiveTodos().length})</button>
        <button class="filter-btn" data-filter="completed" style="
          background: ${state.filter === 'completed' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'};
          border: 2px solid white;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        ">已完成 (${getCompletedTodos().length})</button>
      </div>

      <!-- 待办事项列表 -->
      <div id="todo-list" style="
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 10px;
        max-height: 300px;
        overflow-y: auto;
        backdrop-filter: blur(10px);
      ">
        ${renderTodoListHTML()}
      </div>

      <!-- 应用信息 -->
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
        <div><strong>完成率:</strong> ${Math.round(getCompletedTodos().length / state.todos.length * 100) || 0}%</div>
      </div>
    </div>
  `;

  // 获取DOM元素引用
  todoList = container.querySelector('#todo-list');
  todoInput = container.querySelector('#todo-input');
  addBtn = container.querySelector('#add-btn');
  filterBtns = container.querySelectorAll('.filter-btn');

  // 设置输入框样式
  if (todoInput) {
    todoInput.addEventListener('focus', () => {
      todoInput.style.background = 'rgba(255,255,255,0.5)';
    });

    todoInput.addEventListener('blur', () => {
      todoInput.style.background = 'rgba(255,255,255,0.3)';
    });
  }

  // 添加按钮悬停效果
  if (addBtn) {
    addBtn.addEventListener('mouseenter', () => {
      addBtn.style.background = 'rgba(255,255,255,0.5)';
      addBtn.style.transform = 'scale(1.05)';
    });

    addBtn.addEventListener('mouseleave', () => {
      addBtn.style.background = 'rgba(255,255,255,0.4)';
      addBtn.style.transform = 'scale(1)';
    });
  }
}

/**
 * 渲染待办事项列表HTML
 */
function renderTodoListHTML() {
  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    return '<div style="text-align: center; padding: 20px; opacity: 0.7;">暂无待办事项</div>';
  }

  return filteredTodos.map(todo => `
    <div class="todo-item" data-id="${todo.id}" style="
      background: rgba(255,255,255,0.1);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      ${todo.completed ? 'opacity: 0.7;' : ''}
    ">
      <input
        type="checkbox"
        ${todo.completed ? 'checked' : ''}
        class="todo-checkbox"
        style="
          width: 18px;
          height: 18px;
          cursor: pointer;
        "
      />
      <span class="todo-text" style="
        flex: 1;
        ${todo.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}
      ">${todo.text}</span>
      <button class="delete-btn" data-id="${todo.id}" style="
        background: rgba(220, 53, 69, 0.3);
        border: 1px solid rgba(220, 53, 69, 0.5);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
      ">删除</button>
    </div>
  `).join('');
}

/**
 * 获取过滤后的待办事项
 */
function getFilteredTodos() {
  switch (state.filter) {
    case 'active':
      return getActiveTodos();
    case 'completed':
      return getCompletedTodos();
    default:
      return state.todos;
  }
}

/**
 * 获取进行中的待办事项
 */
function getActiveTodos() {
  return state.todos.filter(todo => !todo.completed);
}

/**
 * 获取已完成的待办事项
 */
function getCompletedTodos() {
  return state.todos.filter(todo => todo.completed);
}

/**
 * 渲染待办事项列表
 */
function renderTodoList() {
  if (todoList) {
    todoList.innerHTML = renderTodoListHTML();
  }

  // 重新绑定列表事件
  bindListEvents();
}

/**
 * 绑定事件监听器
 */
function bindEvents() {
  if (addBtn) {
    addBtn.addEventListener('click', handleAddTodo);
  }

  if (todoInput) {
    todoInput.addEventListener('keypress', handleInputKeypress);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', handleFilterChange);
  });

  bindListEvents();

  // 监听键盘事件
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * 绑定列表相关事件
 */
function bindListEvents() {
  // 复选框事件
  const checkboxes = container?.querySelectorAll('.todo-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleToggleTodo);
  });

  // 删除按钮事件
  const deleteBtns = container?.querySelectorAll('.delete-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', handleDeleteTodo);
  });
}

/**
 * 解绑事件监听器
 */
function unbindEvents() {
  if (addBtn) {
    addBtn.removeEventListener('click', handleAddTodo);
  }

  if (todoInput) {
    todoInput.removeEventListener('keypress', handleInputKeypress);
  }

  filterBtns.forEach(btn => {
    btn.removeEventListener('click', handleFilterChange);
  });

  document.removeEventListener('keydown', handleKeyDown);
}

/**
 * 处理添加待办事项
 */
function handleAddTodo() {
  const text = todoInput?.value?.trim();
  if (!text) return;

  const newTodo = {
    id: state.nextId++,
    text,
    completed: false
  };

  state.todos.unshift(newTodo);
  todoInput.value = '';

  renderTodoList();
  updateFilterButtons();

  console.log('[App2] 添加待办事项:', newTodo);
}

/**
 * 处理输入框回车事件
 */
function handleInputKeypress(event) {
  if (event.key === 'Enter') {
    handleAddTodo();
  }
}

/**
 * 处理切换待办事项状态
 */
function handleToggleTodo(event) {
  const todoId = parseInt(event.target.closest('.todo-item')?.dataset.id);
  if (isNaN(todoId)) return;

  const todo = state.todos.find(t => t.id === todoId);
  if (todo) {
    todo.completed = event.target.checked;
    renderTodoList();
    console.log('[App2] 切换待办事项状态:', todo);
  }
}

/**
 * 处理删除待办事项
 */
function handleDeleteTodo(event) {
  const todoId = parseInt(event.target.dataset.id);
  if (isNaN(todoId)) return;

  state.todos = state.todos.filter(todo => todo.id !== todoId);
  renderTodoList();
  updateFilterButtons();

  console.log('[App2] 删除待办事项:', todoId);
}

/**
 * 处理过滤器变化
 */
function handleFilterChange(event) {
  const filter = event.target.dataset.filter;
  if (filter) {
    state.filter = filter;
    updateFilterButtons();
    renderTodoList();
    console.log('[App2] 过滤器变化:', filter);
  }
}

/**
 * 更新过滤器按钮状态
 */
function updateFilterButtons() {
  filterBtns.forEach(btn => {
    const filter = btn.dataset.filter;
    if (filter === state.filter) {
      btn.style.background = 'rgba(255,255,255,0.4)';
    } else {
      btn.style.background = 'rgba(255,255,255,0.1)';
    }
  });
}

/**
 * 处理键盘事件
 */
function handleKeyDown(event) {
  if (!state.isMounted) return;

  // 快捷键支持
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'n':
        event.preventDefault();
        todoInput?.focus();
        break;
    }
  }
}

/**
 * 获取应用状态
 */
export function getAppState() {
  return {
    ...state,
    todos: [...state.todos]
  };
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
  const event = new CustomEvent('app2-message', {
    detail: { type, data, timestamp: Date.now() }
  });
  window.dispatchEvent(event);
}

/**
 * 监听来自其他应用的消息
 */
export function onMessage(callback) {
  window.addEventListener('app2-message', callback);
  return () => window.removeEventListener('app2-message', callback);
}

// 导出应用信息
console.log('[App2] 应用模块已加载', appConfig);