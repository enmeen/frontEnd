# 微前端主流技术方案

## 1. Webpack Module Federation (模块联邦)

### 概述
Webpack 5 推出的模块联邦功能，允许JavaScript应用在运行时动态加载其他独立部署的代码。

### 核心概念
- **Host (宿主)**: 消费其他应用模块的应用
- **Remote (远程)**: 暴露模块供其他应用使用的应用
- **Federation (联邦)**: 模块共享的配置机制

### 优势
- 官方解决方案，稳定可靠
- 支持运行时动态加载
- 类型安全支持TypeScript
- 依赖共享避免重复打包
- 配置相对简单

### 适用场景
- Webpack生态项目
- 需要类型安全的项目
- 中小型微前端架构

### 配置示例思路
```javascript
// webpack.config.js
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        mfe1: 'mfe1@http://localhost:3001/remoteEntry.js',
      },
      shared: ['react', 'react-dom']
    })
  ]
}
```

---

## 2. Qiankun (乾坤)

### 概述
阿里巴巴开源的微前端框架，基于Single-SPA封装，提供了更完善的微前端解决方案。

### 核心特性
- HTML Entry接入方式
- 样式隔离 (sandbox)
- JS沙箱隔离
- 预加载机制
- 应用间通信

### 优势
- 开箱即用，文档完善
- 社区活跃，生态丰富
- 生产环境验证充分
- 支持多种技术栈
- 完善的错误处理机制

### 适用场景
- 企业级应用
- 需要完善沙箱隔离
- 多技术栈混合项目

### 基本使用思路
```javascript
// 主应用
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:7101',
    container: '#container',
    activeRule: '/vue-app',
  }
]);

start();
```

---

## 3. Single-SPA

### 概述
最早的微前端框架之一，提供了路由驱动的微前端解决方案。

### 核心概念
- 应用注册机制
- 路由匹配规则
- 生命周期管理
- 应用状态管理

### 优势
- 轻量级，核心代码简洁
- 高度可定制
- 技术栈无关
- 社区成熟

### 不足
- 配置相对复杂
- 需要自己处理样式隔离
- 沙箱机制需要自己实现

### 适用场景
- 有定制化需求的团队
- 对框架原理有深入理解的团队
- 轻量级微前端需求

---

## 4. Micro App (京东)

### 概述
京东推出的一款微前端框架，基于Web Components设计。

### 核心特性
- Web Components原生支持
- 类似iframe的隔离效果
- 插件化架构
- 数据预载机制

### 优势
- 强隔离性
- 开发体验友好
- 性能优秀
- 与框架无关

### 适用场景
- 对隔离性要求高的项目
- 需要插件化扩展的场景
- 现代浏览器环境

---

## 5. 无框架方案 (自研)

### 基于路由分发
```javascript
// 简单的路由分发
const appRoutes = {
  '/app1': () => loadApp('app1'),
  '/app2': () => loadApp('app2'),
};

function loadApp(appName) {
  // 动态创建script标签加载子应用
  const script = document.createElement('script');
  script.src = `/${appName}/main.js`;
  document.head.appendChild(script);
}
```

### 基于iframe
- 最简单的隔离方案
- 完全隔离但性能较差
- 通信复杂

### 基于Web Components
```javascript
// 自定义元素封装子应用
class MicroApp extends HTMLElement {
  connectedCallback() {
    // 加载子应用逻辑
  }
}

customElements.define('micro-app', MicroApp);
```

---

## 方案选型建议

### 企业级应用
推荐：**Qiankun** 或 **Module Federation**
- 成熟稳定，生态完善
- 社区支持好，问题解决快
- 生产环境验证充分

### 中小型项目
推荐：**Module Federation**
- 官方支持，维护有保障
- 配置相对简单
- TypeScript支持好

### 定制化需求
推荐：**Single-SPA** 或 **自研**
- 灵活性高，可按需定制
- 深度控制微前端行为
- 避免框架限制

### 现代浏览器环境
推荐：**Micro App** 或 **Web Components**
- 利用浏览器原生特性
- 隔离性强
- 性能优秀

---

*继续阅读：[core-technologies.md](./core-technologies.md) 了解核心技术原理*