/**
 * 命令模式的各种应用场景
 * 撤销/重做只是其中一个重要应用
 */

interface Command {
    execute(): void;
    getDescription(): string;
}

// ============== 场景1：回调和事件处理 ==============
// 这是最基础、最常见的应用

class EventHandler {
    private listeners: Map<string, Command[]> = new Map();
    
    // 注册事件处理器（命令）
    addEventListener(event: string, command: Command): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(command);
    }
    
    // 触发事件
    dispatchEvent(event: string): void {
        const commands = this.listeners.get(event) || [];
        console.log(`触发事件: ${event}`);
        commands.forEach(cmd => {
            console.log(`  执行: ${cmd.getDescription()}`);
            cmd.execute();
        });
    }
}

// 各种事件处理命令
class LogCommand implements Command {
    constructor(private message: string) {}
    
    execute(): void {
        console.log(`[LOG] ${new Date().toLocaleTimeString()}: ${this.message}`);
    }
    
    getDescription(): string {
        return `记录日志: ${this.message}`;
    }
}

class NotificationCommand implements Command {
    constructor(private title: string, private body: string) {}
    
    execute(): void {
        console.log(`📱 通知: ${this.title} - ${this.body}`);
    }
    
    getDescription(): string {
        return `发送通知: ${this.title}`;
    }
}

class AnalyticsCommand implements Command {
    constructor(private event: string, private data: any) {}
    
    execute(): void {
        console.log(`📊 统计: ${this.event}`, this.data);
    }
    
    getDescription(): string {
        return `记录统计: ${this.event}`;
    }
}

// ============== 场景2：API请求封装 ==============
// 网络请求、重试、批处理

class ApiClient {
    async get(url: string): Promise<any> {
        console.log(`GET ${url}`);
        return { data: `Data from ${url}` };
    }
    
    async post(url: string, data: any): Promise<any> {
        console.log(`POST ${url}`, data);
        return { success: true };
    }
}

class ApiCommand implements Command {
    constructor(
        private client: ApiClient,
        private method: 'GET' | 'POST',
        private url: string,
        private data?: any
    ) {}
    
    async execute(): Promise<void> {
        try {
            if (this.method === 'GET') {
                await this.client.get(this.url);
            } else {
                await this.client.post(this.url, this.data);
            }
        } catch (error) {
            console.error(`API请求失败: ${this.url}`, error);
        }
    }
    
    getDescription(): string {
        return `${this.method} ${this.url}`;
    }
}

// API批处理器
class ApiBatchProcessor {
    private commands: Command[] = [];
    
    addRequest(command: Command): void {
        this.commands.push(command);
        console.log(`添加API请求: ${command.getDescription()}`);
    }
    
    async executeAll(): Promise<void> {
        console.log(`批量执行 ${this.commands.length} 个API请求`);
        
        // 并行执行所有请求
        const promises = this.commands.map(cmd => cmd.execute());
        await Promise.all(promises);
        
        console.log('所有API请求完成');
        this.commands = []; // 清空队列
    }
}

// ============== 场景3：任务调度 ==============
// 定时任务、工作流、管道处理

class TaskScheduler {
    private tasks: Array<{ command: Command; delay: number }> = [];
    
    schedule(command: Command, delayMs: number): void {
        this.tasks.push({ command, delay: delayMs });
        console.log(`调度任务: ${command.getDescription()} (延迟 ${delayMs}ms)`);
    }
    
    async runAll(): Promise<void> {
        console.log(`开始执行 ${this.tasks.length} 个调度任务`);
        
        const promises = this.tasks.map(({ command, delay }) => 
            new Promise<void>(resolve => {
                setTimeout(() => {
                    console.log(`执行调度任务: ${command.getDescription()}`);
                    command.execute();
                    resolve();
                }, delay);
            })
        );
        
        await Promise.all(promises);
        console.log('所有调度任务完成');
    }
}

// ============== 场景4：配置和策略切换 ==============
// 动态配置、A/B测试、功能开关

interface ConfigurationCommand extends Command {
    isReversible(): boolean;
    reverse?(): void;
}

class FeatureToggleCommand implements ConfigurationCommand {
    private oldValue: boolean = false;
    
    constructor(
        private config: Map<string, any>,
        private featureName: string,
        private enabled: boolean
    ) {}
    
    execute(): void {
        this.oldValue = this.config.get(this.featureName) || false;
        this.config.set(this.featureName, this.enabled);
        console.log(`功能开关: ${this.featureName} = ${this.enabled}`);
    }
    
    reverse(): void {
        this.config.set(this.featureName, this.oldValue);
        console.log(`恢复功能开关: ${this.featureName} = ${this.oldValue}`);
    }
    
    isReversible(): boolean {
        return true;
    }
    
    getDescription(): string {
        return `切换功能 ${this.featureName}`;
    }
}

// ============== 场景5：游戏开发 ==============
// 技能系统、AI行为、游戏状态

class Player {
    constructor(
        public name: string,
        public hp: number = 100,
        public mp: number = 50
    ) {}
}

class GameCommand implements Command {
    protected player: Player;
    
    constructor(player: Player) {
        this.player = player;
    }
    
    execute(): void {
        throw new Error('子类必须实现 execute 方法');
    }
    
    getDescription(): string {
        return '游戏命令';
    }
}

class AttackCommand extends GameCommand {
    constructor(player: Player, private target: Player, private damage: number) {
        super(player);
    }
    
    execute(): void {
        this.target.hp -= this.damage;
        console.log(`${this.player.name} 攻击 ${this.target.name}，造成 ${this.damage} 伤害`);
        console.log(`${this.target.name} 剩余血量: ${this.target.hp}`);
    }
    
    getDescription(): string {
        return `${this.player.name} 攻击`;
    }
}

class HealCommand extends GameCommand {
    constructor(player: Player, private healAmount: number) {
        super(player);
    }
    
    execute(): void {
        const oldHp = this.player.hp;
        this.player.hp = Math.min(100, this.player.hp + this.healAmount);
        const actualHeal = this.player.hp - oldHp;
        console.log(`${this.player.name} 恢复 ${actualHeal} 血量，当前血量: ${this.player.hp}`);
    }
    
    getDescription(): string {
        return `${this.player.name} 治疗`;
    }
}

// 游戏回合系统
class TurnSystem {
    private turnQueue: Command[] = [];
    
    queueAction(command: Command): void {
        this.turnQueue.push(command);
        console.log(`动作入队: ${command.getDescription()}`);
    }
    
    processTurn(): void {
        console.log('\n--- 处理回合 ---');
        while (this.turnQueue.length > 0) {
            const command = this.turnQueue.shift()!;
            command.execute();
        }
        console.log('--- 回合结束 ---\n');
    }
}

// ============== 使用示例 ==============

function eventHandlerExample() {
    console.log('\n=== 事件处理示例（无撤销功能）===');
    
    const eventHandler = new EventHandler();
    
    // 注册用户登录事件的多个处理器
    eventHandler.addEventListener('user.login', new LogCommand('用户登录'));
    eventHandler.addEventListener('user.login', new NotificationCommand('欢迎', '登录成功'));
    eventHandler.addEventListener('user.login', new AnalyticsCommand('login', { userId: 123, timestamp: Date.now() }));
    
    // 触发事件，所有命令自动执行
    eventHandler.dispatchEvent('user.login');
}

function apiExample() {
    console.log('\n=== API批处理示例（无撤销功能）===');
    
    const apiClient = new ApiClient();
    const batchProcessor = new ApiBatchProcessor();
    
    // 添加多个API请求命令
    batchProcessor.addRequest(new ApiCommand(apiClient, 'GET', '/api/users'));
    batchProcessor.addRequest(new ApiCommand(apiClient, 'POST', '/api/analytics', { event: 'pageview' }));
    batchProcessor.addRequest(new ApiCommand(apiClient, 'GET', '/api/notifications'));
    
    // 批量执行（在实际应用中会是异步的）
    console.log('开始批量处理...');
}

function gameExample() {
    console.log('\n=== 游戏回合系统示例（无撤销功能）===');
    
    const player1 = new Player('勇者', 80, 30);
    const player2 = new Player('魔王', 120, 50);
    const turnSystem = new TurnSystem();
    
    // 队列化本回合的所有动作
    turnSystem.queueAction(new AttackCommand(player1, player2, 25));
    turnSystem.queueAction(new AttackCommand(player2, player1, 20));
    turnSystem.queueAction(new HealCommand(player1, 15));
    
    // 处理回合
    turnSystem.processTurn();
}

function configExample() {
    console.log('\n=== 配置切换示例（可逆转，但不是传统意义的撤销）===');
    
    const config = new Map<string, any>();
    config.set('darkMode', false);
    config.set('notifications', true);
    
    const toggleDarkMode = new FeatureToggleCommand(config, 'darkMode', true);
    
    console.log('当前配置:', Array.from(config.entries()));
    
    toggleDarkMode.execute();
    console.log('执行后配置:', Array.from(config.entries()));
    
    if (toggleDarkMode.isReversible()) {
        toggleDarkMode.reverse!();
        console.log('恢复后配置:', Array.from(config.entries()));
    }
}

// ============== 应用场景总结 ==============
function summarizeUseCases() {
    console.log('\n=== 命令模式应用场景总结 ===');
    console.log(`
📊 命令模式的主要应用场景（按使用频率排序）：

1️⃣ 事件处理和回调 (最常见)
   • GUI按钮点击、网页事件
   • 消息队列处理
   • 观察者模式的实现

2️⃣ API请求封装 (很常见)
   • HTTP请求批处理
   • 重试机制
   • 请求缓存和优化

3️⃣ 任务调度和工作流 (常见)
   • 定时任务
   • 批处理作业
   • 管道处理

4️⃣ 配置和策略切换 (常见)
   • 功能开关
   • A/B测试
   • 主题切换

5️⃣ 撤销/重做功能 (重要但不是最常见)
   • 文本编辑器
   • 图形编辑器
   • 数据库事务

6️⃣ 游戏开发 (特定领域)
   • 技能系统
   • AI行为
   • 回合制系统

🎯 关键洞察：
• 撤销/重做虽然重要，但不是命令模式的主要用途
• 最常见的用途其实是事件处理和解耦
• 撤销功能之所以被强调，是因为它最能展示模式的威力
    `);
}

// 运行所有示例
export function runAllUseCaseExamples() {
    eventHandlerExample();
    apiExample();
    gameExample(); 
    configExample();
    summarizeUseCases();
}

// 直接运行
if (typeof window === 'undefined') {
    runAllUseCaseExamples();
}
