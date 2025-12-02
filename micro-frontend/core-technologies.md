# 微前端核心技术

## 1. 应用加载机制

### 动态加载原理
微前端的核心是能够动态加载和卸载子应用，主要实现方式：

#### Script标签注入
```javascript
function loadApp(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

#### ES Module动态导入
```javascript
// 现代浏览器支持
const module = await import('./sub-app.js');
```

#### SystemJS模块加载器
```javascript
// 支持多种模块格式
System.import('sub-app').then(module => {
  // 使用模块
});
```

### 应用生命周期
微前端应用需要完整的管理生命周期：

```javascript
// 子应用需要暴露的生命周期函数
export async function bootstrap() {
  // 初始化，只调用一次
}

export async function mount(props) {
  // 挂载，传入主应用的数据
  ReactDOM.render(<App />, document.getElementById('root'));
}

export async function unmount() {
  // 卸载，清理资源
  ReactDOM.unmountComponentAtNode(document.getElementById('root'));
}
```

## 2. 路由管理

### 路由分发策略

#### 基于路径匹配
```javascript
const routes = {
  '/app1/*': loadApp1,
  '/app2/*': loadApp2,
  '/': loadMainApp
};

function routeHandler(location) {
  for (const pattern in routes) {
    if (location.pathname.startsWith(pattern.replace('/*', ''))) {
      routes[pattern]();
      break;
    }
  }
}
```

#### 前端路由劫持
```javascript
// 拦截路由变化
const originalPushState = history.pushState;
history.pushState = function(state, title, url) {
  originalPushState.call(this, state, title, url);
  handleRouteChange(url);
};

window.addEventListener('popstate', handleRouteChange);
```

### 路由状态同步
- 主应用和子应用路由状态需要保持一致
- 子应用路由变化需要通知主应用
- 支持浏览器前进后退

## 3. 样式隔离

### 隔离的必要性
- 避免CSS全局污染
- 防止样式覆盖
- 确保应用间样式独立

### 实现方案

#### CSS Scoped
```css
/* Vue Scoped CSS */
.app-container[data-v-f3f3eg9] {
  color: red;
}

/* 编译后 */
.app-container[data-v-f3f3eg9] {
  color: red;
}
```

#### Shadow DOM
```javascript
// 创建Shadow DOM隔离
class ShadowApp extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        /* 样式完全隔离 */
        .container { color: blue; }
      </style>
      <div class="container">Shadow Content</div>
    `;
  }
}
```

#### CSS Prefix
```javascript
// 自动添加CSS前缀
function addCssPrefix(css, prefix) {
  return css.replace(/([^\s{}]+){/g, `${prefix} $1{`);
}
```

#### CSS-in-JS
```javascript
// 使用styled-components等方案
const StyledContainer = styled.div`
  color: ${props => props.color || 'black'};
`;
```

## 4. JS沙箱隔离

### 隔离目标
- 避免全局变量污染
- 防止原型链修改
- 隔离事件监听器
- 控制DOM操作范围

### 实现方案

#### 快照沙箱 (Snapshot Sandbox)
```javascript
class SnapshotSandbox {
  constructor() {
    this.windowSnapshot = {};
    this.modifyPropsMap = {};
  }

  active() {
    // 记录当前window状态
    this.windowSnapshot = {};
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop];
    }

    // 恢复之前的修改
    Object.keys(this.modifyPropsMap).forEach(p => {
      window[p] = this.modifyPropsMap[p];
    });
  }

  inactive() {
    // 记录修改
    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = window[prop];
        window[prop] = this.windowSnapshot[prop];
      }
    }
  }
}
```

#### Proxy沙箱 (Proxy Sandbox)
```javascript
class ProxySandbox {
  constructor() {
    this.sandbox = new Proxy(window, {
      get: (target, key) => {
        // 优先从沙箱中获取
        if (this[key] !== undefined) {
          return this[key];
        }
        return target[key];
      },
      set: (target, key, value) => {
        // 设置到沙箱中
        this[key] = value;
        return true;
      }
    });
  }

  getSandbox() {
    return this.sandbox;
  }
}
```

#### iframe沙箱
```javascript
// 利用iframe天然隔离特性
function createIframeSandbox() {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  return {
    window: iframe.contentWindow,
    document: iframe.contentDocument
  };
}
```

## 5. 应用间通信

### 通信场景
- 数据共享和状态同步
- 事件通知和响应
- 用户信息传递
- 业务流程协同

### 通信机制

#### 全局事件总线
```javascript
// 主应用提供事件总线
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}
```

#### Props传递
```javascript
// 主应用向子应用传递数据
registerMicroApps([
  {
    name: 'sub-app',
    entry: '//localhost:3001',
    container: '#container',
    props: {
      userInfo: { name: 'John', age: 30 },
      router: router,
      store: store
    }
  }
]);
```

#### Shared状态管理
```javascript
// 共享状态实例
class SharedStore {
  constructor() {
    this.state = {};
    this.listeners = [];
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}
```

#### LocalStorage/SessionStorage
```javascript
// 浏览器存储通信
class StorageBridge {
  static set(key, value) {
    localStorage.setItem(`micro-${key}`, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('storage-change', {
      detail: { key, value }
    }));
  }

  static get(key) {
    const value = localStorage.getItem(`micro-${key}`);
    return value ? JSON.parse(value) : null;
  }
}
```

## 6. 资源预加载

### 预加载策略
- 预加载核心资源
- 懒加载非关键资源
- 缓存策略优化

### 实现方式
```javascript
// 预加载子应用资源
function preloadApp(appName, entry) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = entry;
  document.head.appendChild(link);
}

// 预解析DNS
function preconnect(origin) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  document.head.appendChild(link);
}
```

---

*继续阅读：[implementation-examples.md](./implementation-examples.md) 查看具体实现示例*