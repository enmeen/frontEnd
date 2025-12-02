# Mini Single-SPA

🚀 简化版微前端框架 - 专注核心功能，易于学习和理解

## 📖 项目简介

Mini Single-SPA 是一个专门为学习微前端概念而设计的简化版框架。它移除了生产环境的复杂性，专注于核心功能的实现，帮助开发者深入理解微前端架构的工作原理。

### 🎯 设计目标

- **专注核心**: 只包含微前端的核心功能，代码结构清晰
- **易于学习**: 详细的注释和说明，每个模块都有完整的学习文档
- **渐进式理解**: 从简单到复杂的学习路径
- **可视化演示**: 丰富的示例和交互式演示

## 🏗️ 项目结构

```
mini-single-spa/
├── README.md                    # 项目说明文档
├── index.html                   # 主演示页面
├── src/                         # 源代码目录
│   ├── core/                    # 核心功能模块
│   │   ├── single-spa.js        # 主要的微前端框架逻辑
│   │   ├── router.js            # 路由管理
│   │   ├── app-loader.js        # 应用加载器
│   │   └── lifecycle.js         # 生命周期管理
│   ├── apps/                    # 示例微应用
│   │   ├── app1/                # 计数器应用示例
│   │   │   ├── main.js
│   │   │   └── index.html
│   │   └── app2/                # 待办事项应用示例
│   │       ├── main.js
│   │       └── index.html
│   └── utils/                   # 工具函数
│       ├── dom.js               # DOM操作工具
│       └── logger.js            # 日志工具
└── examples/                    # 使用示例
    ├── basic-routing/           # 基础路由示例
    └── lifecycle-demo/          # 生命周期演示
```

## 🚀 快速开始

### 1. 直接在浏览器中运行

```bash
# 启动一个简单的HTTP服务器
cd mini-single-spa
python -m http.server 8080
# 或者使用 Node.js
npx serve .
```

然后在浏览器中访问 `http://localhost:8080`

### 2. 基本使用

```javascript
import { registerApplication, start } from './src/core/single-spa.js';

// 注册微应用
registerApplication(
  'app1',
  () => import('./src/apps/app1/main.js'),
  () => window.location.pathname.startsWith('/app1')
);

// 启动框架
start();
```

## 📚 核心模块详解

### 1. single-spa.js - 核心框架

这是整个微前端框架的核心，负责：

- **应用注册表管理**: 维护所有已注册的微应用
- **应用状态机**: 管理应用的7种状态
- **生命周期调度**: 协调应用的加载、挂载、卸载过程
- **事件系统**: 提供应用间的事件通信机制

```javascript
// 应用状态
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
```

### 2. router.js - 路由管理

负责URL路由的管理和应用激活条件的判断：

- **路由监听**: 监听浏览器导航事件
- **路由匹配**: 支持多种匹配策略（精确、前缀、正则）
- **应用激活**: 根据URL自动激活对应的应用

```javascript
// 创建激活函数
const activeWhen = createActiveWhen('/app1');

// 或者使用自定义函数
const customActiveWhen = () => {
  return window.location.hash === '#dashboard';
};
```

### 3. app-loader.js - 应用加载器

负责动态加载和执行微应用：

- **动态加载**: 支持从URL、函数、配置对象加载应用
- **沙箱隔离**: 基础的JavaScript沙箱机制
- **错误处理**: 完善的错误捕获和重试机制
- **缓存管理**: 应用加载结果缓存

```javascript
// 从URL加载应用
const app = await loadApp('https://example.com/app.js');

// 从函数加载应用
const app = await loadApp(() => {
  return {
    mount: () => console.log('App mounted'),
    unmount: () => console.log('App unmounted')
  };
});
```

### 4. lifecycle.js - 生命周期管理

管理微应用的完整生命周期：

- **生命周期阶段**: Bootstrap、Mount、Unmount、Update
- **全局钩子**: 支持注册全局生命周期钩子
- **性能监控**: 记录每个阶段的执行时间和状态
- **错误处理**: 完善的错误捕获和恢复机制

```javascript
// 注册生命周期钩子
registerLifecycleHook(LifecyclePhases.MOUNT, 'before', (context) => {
  console.log('应用即将挂载:', context.app.name);
});
```

## 🎮 示例应用

### App1 - 计数器应用

一个简单的计数器应用，展示基础的微应用结构：

- **交互功能**: 增加、减少、重置计数
- **键盘支持**: 方向键和快捷键操作
- **状态管理**: 应用内部状态维护
- **样式美化**: 现代化的UI设计

### App2 - 待办事项应用

功能更完整的待办事项管理应用：

- **CRUD操作**: 创建、读取、更新、删除待办事项
- **状态过滤**: 全部、进行中、已完成状态筛选
- **数据持久化**: 基础的数据存储机制
- **统计功能**: 完成率等统计信息

## 🛠️ 工具函数

### dom.js - DOM操作工具

提供常用的DOM操作和管理功能：

```javascript
// 创建应用容器
const container = createAppContainer('my-app');

// 等待元素出现
const element = await waitForElement('#my-element');

// 事件委托
delegate(parent, '.button', 'click', handler);
```

### logger.js - 日志工具

统一的日志记录和管理系统：

```javascript
import { configureLogger, info, warn, error } from './src/utils/logger.js';

// 配置日志器
configureLogger({
  level: LogLevel.INFO,
  enableStorage: true
});

// 使用日志
info('应用启动成功');
warn('这是一个警告');
error('发生错误', error);
```

## 📖 学习路径

### 1. 基础概念理解

- 阅读 `single-spa.js` 了解应用注册和状态管理
- 学习 `router.js` 理解路由匹配机制
- 查看 `app-loader.js` 了解应用加载过程

### 2. 生命周期深入

- 研究 `lifecycle.js` 掌握生命周期管理
- 查看 `examples/lifecycle-demo/` 体验生命周期流程
- 学习全局钩子的使用方法

### 3. 实践应用开发

- 分析 `src/apps/` 中的示例应用
- 尝试创建自己的微应用
- 实践应用间通信和状态共享

### 4. 高级特性

- 沙箱隔离机制
- 性能优化技巧
- 错误处理和恢复
- 应用预加载策略

## 🎯 核心特性

### ✨ 应用管理

- **动态注册**: 运行时注册和注销微应用
- **状态跟踪**: 实时跟踪应用状态和执行情况
- **生命周期**: 完整的应用生命周期管理
- **错误隔离**: 应用错误不会影响其他应用

### 🧭 智能路由

- **自动匹配**: 根据URL自动激活对应应用
- **多种策略**: 支持精确匹配、前缀匹配、正则匹配
- **参数解析**: 支持路由参数解析和传递
- **历史管理**: 完整的浏览器历史记录支持

### 🔒 安全隔离

- **JavaScript沙箱**: 基础的全局变量隔离
- **样式隔离**: CSS样式作用域隔离
- **DOM隔离**: 应用DOM元素的边界管理
- **事件隔离**: 应用间事件的隔离管理

### 📊 开发工具

- **调试面板**: 可视化的应用状态监控
- **日志系统**: 详细的执行日志和错误追踪
- **性能分析**: 生命周期执行时间统计
- **事件追踪**: 完整的事件流监控

## 🔧 API 参考

### 应用注册

```javascript
// 注册微应用
registerApplication(name, loadingFunction, activeWhen, customProps)

// 参数说明
// name: string - 应用名称（唯一标识）
// loadingFunction: Function - 应用加载函数
// activeWhen: Function - 应用激活条件函数
// customProps: Object - 传递给应用的自定义属性
```

### 应用状态

```javascript
// 获取应用状态
getAppStatus(appName)

// 获取所有应用
getApplications()

// 根据名称获取应用
getApplicationByName(appName)
```

### 事件监听

```javascript
// 监听应用事件
on(eventName, listener)

// 常见事件
// 'application-registered' - 应用注册
// 'application-loading' - 应用加载中
// 'application-loaded' - 应用加载完成
// 'application-mounting' - 应用挂载中
// 'application-mounted' - 应用挂载完成
// 'application-unmounting' - 应用卸载中
// 'application-unmounted' - 应用卸载完成
```

## 🚨 注意事项

### 学习版本限制

这个项目是**学习版本**，主要用于：

- ✅ 理解微前端核心概念
- ✅ 学习应用生命周期管理
- ✅ 掌握路由管理机制
- ✅ 实践应用开发模式

**不适用于生产环境**：

- ❌ 缺少完整的安全性测试
- ❌ 性能优化不够充分
- ❌ 缺少企业级功能支持
- ❌ 测试覆盖率不足

### 浏览器兼容性

- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

需要支持 ES6+ 模块和现代 JavaScript 特性。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发环境设置

```bash
# 克隆项目
git clone <repository-url>
cd micro-frontend/mini-single-spa

# 启动开发服务器
python -m http.server 8080
```

### 提交规范

- 代码注释要详细，特别是核心逻辑
- 新功能需要包含相应的测试示例
- 文档更新要与代码同步
- 遵循现有的代码风格

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Single-SPA](https://single-spa.js.org/) - 微前端框架的灵感来源
- [Module Federation](https://webpack.js.org/concepts/module-federation/) - 模块联邦技术参考
- [Qiankun](https://qiankun.umijs.org/) - 蚂蚁金服微前端解决方案

---

**Happy Learning! 🎓**

如果这个项目帮助你理解了微前端的概念，请给一个 ⭐ Star！