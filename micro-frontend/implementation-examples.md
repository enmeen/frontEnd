# 微前端实现示例

## 1. 最简单的微前端实现

### 基于路由的手动加载

#### 主应用 (main.html)
```html
<!DOCTYPE html>
<html>
<head>
    <title>微前端主应用</title>
    <style>
        .nav { display: flex; gap: 20px; }
        .nav a { padding: 10px; text-decoration: none; }
        .container { margin-top: 20px; min-height: 400px; }
    </style>
</head>
<body>
    <div class="nav">
        <a href="#/app1">应用1</a>
        <a href="#/app2">应用2</a>
        <a href="#/main">主页</a>
    </div>
    <div id="app-container" class="container">
        <h2>主应用主页</h2>
    </div>

    <script>
        class MicroFrontend {
            constructor() {
                this.apps = {
                    '/app1': {
                        url: 'http://localhost:3001/app1.js',
                        container: 'app-container'
                    },
                    '/app2': {
                        url: 'http://localhost:3002/app2.js',
                        container: 'app-container'
                    }
                };
                this.currentApp = null;
                this.initRouter();
            }

            initRouter() {
                window.addEventListener('hashchange', () => this.handleRoute());
                this.handleRoute();
            }

            handleRoute() {
                const route = window.location.hash.slice(1) || '/main';

                if (this.apps[route]) {
                    this.loadApp(this.apps[route]);
                } else {
                    this.showMain();
                }
            }

            async loadApp(appConfig) {
                // 卸载当前应用
                if (this.currentApp) {
                    this.unloadApp(this.currentApp);
                }

                // 清空容器
                const container = document.getElementById(appConfig.container);
                container.innerHTML = '';

                // 加载新应用
                try {
                    await this.loadScript(appConfig.url);

                    // 调用应用挂载函数
                    if (window.microApp) {
                        window.microApp.mount(container);
                        this.currentApp = appConfig;
                    }
                } catch (error) {
                    console.error('加载应用失败:', error);
                    container.innerHTML = '<p>应用加载失败</p>';
                }
            }

            unloadApp(appConfig) {
                // 调用应用卸载函数
                if (window.microApp && window.microApp.unmount) {
                    window.microApp.unmount();
                }
            }

            loadScript(url) {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = url;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            showMain() {
                const container = document.getElementById('app-container');
                container.innerHTML = '<h2>主应用主页</h2>';
                this.currentApp = null;
            }
        }

        // 启动微前端系统
        new MicroFrontend();
    </script>
</body>
</html>
```

#### 子应用1 (app1.js)
```javascript
// 子应用1的入口文件
window.microApp = {
    mount(container) {
        console.log('App1 mounted to:', container);

        // 创建应用内容
        const appContent = document.createElement('div');
        appContent.innerHTML = `
            <style>
                .app1 {
                    background: #e3f2fd;
                    padding: 20px;
                    border-radius: 8px;
                }
                .app1 h3 { color: #1976d2; }
                .app1 button {
                    background: #1976d2;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
            </style>
            <div class="app1">
                <h3>子应用1 - React应用</h3>
                <p>这是一个简单的React子应用示例</p>
                <button onclick="showAlert()">点击我</button>
                <p>当前时间: <span id="time"></span></p>
            </div>
        `;

        // 添加到容器
        const containerEl = typeof container === 'string' ?
            document.getElementById(container) : container;
        containerEl.appendChild(appContent);

        // 启动定时器
        this.timer = setInterval(() => {
            const timeEl = document.getElementById('time');
            if (timeEl) {
                timeEl.textContent = new Date().toLocaleTimeString();
            }
        }, 1000);

        // 全局函数
        window.showAlert = () => {
            alert('来自子应用1的问候！');
        };
    },

    unmount() {
        console.log('App1 unmounting');

        // 清理定时器
        if (this.timer) {
            clearInterval(this.timer);
        }

        // 清理全局函数
        delete window.showAlert;
    }
};

console.log('子应用1已加载');
```

#### 子应用2 (app2.js)
```javascript
// 子应用2的入口文件
window.microApp = {
    mount(container) {
        console.log('App2 mounted to:', container);

        // 创建应用内容
        const appContent = document.createElement('div');
        appContent.innerHTML = `
            <style>
                .app2 {
                    background: #f3e5f5;
                    padding: 20px;
                    border-radius: 8px;
                }
                .app2 h3 { color: #7b1fa2; }
                .app2 input {
                    padding: 8px;
                    margin: 5px;
                    border: 1px solid #7b1fa2;
                    border-radius: 4px;
                }
                .app2 button {
                    background: #7b1fa2;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
            </style>
            <div class="app2">
                <h3>子应用2 - Vue应用风格</h3>
                <p>这是一个Vue风格的子应用示例</p>
                <div>
                    <input type="text" id="nameInput" placeholder="输入你的名字">
                    <button onclick="greet()">问候</button>
                </div>
                <div id="greeting" style="margin-top: 10px;"></div>
            </div>
        `;

        // 添加到容器
        const containerEl = typeof container === 'string' ?
            document.getElementById(container) : container;
        containerEl.appendChild(appContent);

        // 全局函数
        window.greet = () => {
            const input = document.getElementById('nameInput');
            const greeting = document.getElementById('greeting');

            if (input.value.trim()) {
                greeting.textContent = `你好, ${input.value}! 欢迎来到子应用2`;
            } else {
                greeting.textContent = '请先输入你的名字';
            }
        };
    },

    unmount() {
        console.log('App2 unmounting');

        // 清理全局函数
        delete window.greet;
    }
};

console.log('子应用2已加载');
```

## 2. Module Federation配置示例

### 主应用配置 (webpack.main.js)
```javascript
const ModuleFederationPlugin = require('@module-federation/webpack');
const deps = require('./package.json').dependencies;

module.exports = {
  mode: 'development',
  devServer: { port: 3000 },

  plugins: [
    new ModuleFederationPlugin({
      name: 'main',
      remotes: {
        // 远程应用配置
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        ...deps,
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
      },
    }),
  ],
};
```

### 子应用配置 (webpack.app1.js)
```javascript
const ModuleFederationPlugin = require('@module-federation/webpack');
const deps = require('./package.json').dependencies;

module.exports = {
  mode: 'development',
  devServer: { port: 3001 },

  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        // 暴露组件
        './App': './src/App',
        './Button': './src/Button',
      },
      shared: {
        ...deps,
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
      },
    }),
  ],
};
```

### 主应用使用远程组件
```javascript
import React, { lazy, Suspense } from 'react';

// 动态导入远程组件
const RemoteApp1 = lazy(() => import('app1/App'));
const RemoteButton = lazy(() => import('app1/Button'));

function MainApp() {
  return (
    <div>
      <h1>主应用</h1>

      <Suspense fallback="加载中...">
        <RemoteApp1 />
      </Suspense>

      <Suspense fallback="加载中...">
        <RemoteButton>远程按钮</RemoteButton>
      </Suspense>
    </div>
  );
}
```

## 3. Qiankun使用示例

### 主应用配置
```javascript
import { registerMicroApps, start, addGlobalUncaughtErrorHandler } from 'qiankun';

// 注册子应用
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:8080',
    container: '#vue-app',
    activeRule: '/vue-app',
    props: {
      data: '主应用传递的数据'
    }
  },
  {
    name: 'react-app',
    entry: '//localhost:3000',
    container: '#react-app',
    activeRule: '/react-app',
  }
]);

// 全局错误处理
addGlobalUncaughtErrorHandler((event) => {
  console.error('微应用加载出错:', event);
});

// 启动
start({
  sandbox: {
    experimentalStyleIsolation: true, // 样式隔离
  }
});
```

### 子应用配置 (Vue)
```javascript
// public-path.js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

// main.js
import Vue from 'vue';
import App from './App.vue';
import router from './router';

let instance = null;

function render(props = {}) {
  const { container } = props;

  instance = new Vue({
    router,
    render: h => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app');
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// 微前端生命周期
export async function bootstrap() {
  console.log('Vue app bootstraped');
}

export async function mount(props) {
  console.log('props from main framework', props);
  render(props);
}

export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
}
```

## 4. 简单的沙箱实现

```javascript
class SimpleSandbox {
  constructor() {
    this.sandboxWindow = {};
    this.modifiers = [];
  }

  activate() {
    // 创建代理沙箱
    this.proxy = new Proxy(window, {
      get: (target, key) => {
        // 优先从沙箱获取
        if (this.sandboxWindow[key] !== undefined) {
          return this.sandboxWindow[key];
        }
        return target[key];
      },

      set: (target, key, value) => {
        // 记录修改
        if (target[key] !== value) {
          this.modifiers.push({ key, oldValue: target[key], newValue: value });
        }

        // 设置到沙箱
        this.sandboxWindow[key] = value;
        return true;
      }
    });

    return this.proxy;
  }

  deactivate() {
    // 恢复原始状态
    this.modifiers.forEach(({ key, oldValue }) => {
      if (oldValue === undefined) {
        delete window[key];
      } else {
        window[key] = oldValue;
      }
    });

    this.modifiers = [];
    this.sandboxWindow = {};
  }
}

// 使用示例
const sandbox = new SimpleSandbox();
const sandboxWindow = sandbox.activate();

// 在沙箱中执行代码
function executeInSandbox(code) {
  return new Function('window', code)(sandboxWindow);
}
```

## 5. 应用间通信示例

```javascript
// 简单的事件总线
class MicroEventBus {
  constructor() {
    this.events = {};
  }

  // 订阅事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // 发布事件
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  // 取消订阅
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// 全局事件总线实例
window.microEventBus = new MicroEventBus();

// 应用1发送消息
window.microEventBus.emit('user-login', { userId: 123, name: 'John' });

// 应用2接收消息
window.microEventBus.on('user-login', (userData) => {
  console.log('用户登录:', userData);
  // 更新应用状态
});
```

这些示例展示了微前端的核心实现原理，可以根据具体需求选择合适的方案进行开发。

---

*继续阅读：[comparison.md](./comparison.md) 查看方案对比分析*