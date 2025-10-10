/**
 * 命令模式的不同复杂度示例
 * 展示核心组件的必要性和可选性
 */

console.log('=== 命令模式组件必要性示例 ===\n');

// ============== 示例1：最简化版本 ==============
// 只有 Command接口 + ConcreteCommand，没有独立的Receiver
// 适用于：简单的回调、事件处理

interface SimpleCommand {
    execute(): void;
    undo?(): void;  // 可选的撤销功能
}

// 具体命令直接包含所有逻辑，不需要Receiver
class AlertCommand implements SimpleCommand {
    constructor(private message: string) {}
    
    execute(): void {
        console.log(`弹出提示: ${this.message}`);
    }
}

class LogCommand implements SimpleCommand {
    constructor(private level: string, private message: string) {}
    
    execute(): void {
        console.log(`[${this.level}] ${new Date().toLocaleTimeString()}: ${this.message}`);
    }
}

// 最简单的使用方式（Client直接调用，没有专门的Invoker）
function simpleExample() {
    console.log('--- 示例1：最简化版本 ---');
    
    const commands = [
        new AlertCommand('欢迎使用系统'),
        new LogCommand('INFO', '用户登录成功'),
        new LogCommand('WARNING', '内存使用率较高')
    ];
    
    // Client直接执行命令
    commands.forEach(cmd => cmd.execute());
    console.log();
}

// ============== 示例2：简化版本 ==============
// 有Receiver，但Invoker很简单
// 适用于：需要操作外部对象，但调用逻辑不复杂

// Receiver：被操作的对象
class Calculator {
    private result: number = 0;
    
    add(value: number): number {
        this.result += value;
        console.log(`计算: ${this.result - value} + ${value} = ${this.result}`);
        return this.result;
    }
    
    subtract(value: number): number {
        this.result -= value;
        console.log(`计算: ${this.result + value} - ${value} = ${this.result}`);
        return this.result;
    }
    
    getResult(): number {
        return this.result;
    }
    
    setResult(value: number): void {
        this.result = value;
    }
}

// Command接口
interface CalculatorCommand {
    execute(): number;
    undo(): void;
}

// 具体命令：加法
class AddCommand implements CalculatorCommand {
    constructor(private calculator: Calculator, private value: number) {}
    
    execute(): number {
        return this.calculator.add(this.value);
    }
    
    undo(): void {
        this.calculator.subtract(this.value);
        console.log('撤销加法操作');
    }
}

// 具体命令：减法
class SubtractCommand implements CalculatorCommand {
    private previousValue: number = 0;
    
    constructor(private calculator: Calculator, private value: number) {}
    
    execute(): number {
        this.previousValue = this.calculator.getResult();
        return this.calculator.subtract(this.value);
    }
    
    undo(): void {
        this.calculator.setResult(this.previousValue);
        console.log('撤销减法操作');
    }
}

// 简化的Invoker：只管理当前命令
class SimpleCalculatorInvoker {
    private lastCommand: CalculatorCommand | null = null;
    
    executeCommand(command: CalculatorCommand): number {
        const result = command.execute();
        this.lastCommand = command;
        return result;
    }
    
    undo(): void {
        if (this.lastCommand) {
            this.lastCommand.undo();
        } else {
            console.log('没有可撤销的操作');
        }
    }
}

function simplifiedExample() {
    console.log('--- 示例2：简化版本（有Receiver，简单Invoker） ---');
    
    const calculator = new Calculator();  // Receiver
    const invoker = new SimpleCalculatorInvoker();  // 简化的Invoker
    
    // Client创建并执行命令
    invoker.executeCommand(new AddCommand(calculator, 10));
    invoker.executeCommand(new AddCommand(calculator, 5));
    invoker.executeCommand(new SubtractCommand(calculator, 3));
    
    console.log(`最终结果: ${calculator.getResult()}`);
    invoker.undo();  // 撤销最后一个操作
    console.log(`撤销后结果: ${calculator.getResult()}`);
    console.log();
}

// ============== 示例3：完整版本 ==============
// 所有组件都有，功能最完善
// 适用于：复杂的业务逻辑，需要历史记录、批量操作等

// 多个Receiver
class FileSystem {
    private files: Set<string> = new Set();
    
    createFile(filename: string): void {
        this.files.add(filename);
        console.log(`创建文件: ${filename}`);
    }
    
    deleteFile(filename: string): boolean {
        if (this.files.has(filename)) {
            this.files.delete(filename);
            console.log(`删除文件: ${filename}`);
            return true;
        }
        return false;
    }
    
    fileExists(filename: string): boolean {
        return this.files.has(filename);
    }
    
    listFiles(): string[] {
        return Array.from(this.files);
    }
}

class Logger {
    log(action: string, details: string): void {
        console.log(`[LOG] ${new Date().toLocaleTimeString()}: ${action} - ${details}`);
    }
}

// Command接口
interface FileCommand {
    execute(): boolean;
    undo(): boolean;
    getDescription(): string;
}

// 具体命令：创建文件
class CreateFileCommand implements FileCommand {
    constructor(
        private fileSystem: FileSystem,
        private logger: Logger,
        private filename: string
    ) {}
    
    execute(): boolean {
        this.fileSystem.createFile(this.filename);
        this.logger.log('CREATE', this.filename);
        return true;
    }
    
    undo(): boolean {
        const success = this.fileSystem.deleteFile(this.filename);
        if (success) {
            this.logger.log('UNDO_CREATE', this.filename);
        }
        return success;
    }
    
    getDescription(): string {
        return `创建文件 ${this.filename}`;
    }
}

// 具体命令：删除文件
class DeleteFileCommand implements FileCommand {
    private fileExisted: boolean = false;
    
    constructor(
        private fileSystem: FileSystem,
        private logger: Logger,
        private filename: string
    ) {}
    
    execute(): boolean {
        this.fileExisted = this.fileSystem.fileExists(this.filename);
        if (this.fileExisted) {
            this.fileSystem.deleteFile(this.filename);
            this.logger.log('DELETE', this.filename);
            return true;
        } else {
            console.log(`文件不存在: ${this.filename}`);
            return false;
        }
    }
    
    undo(): boolean {
        if (this.fileExisted) {
            this.fileSystem.createFile(this.filename);
            this.logger.log('UNDO_DELETE', this.filename);
            return true;
        }
        return false;
    }
    
    getDescription(): string {
        return `删除文件 ${this.filename}`;
    }
}

// 宏命令
class BatchCommand implements FileCommand {
    constructor(private commands: FileCommand[], private description: string) {}
    
    execute(): boolean {
        console.log(`执行批量操作: ${this.description}`);
        let allSuccess = true;
        for (const command of this.commands) {
            if (!command.execute()) {
                allSuccess = false;
            }
        }
        return allSuccess;
    }
    
    undo(): boolean {
        console.log(`撤销批量操作: ${this.description}`);
        let allSuccess = true;
        // 逆序撤销
        for (let i = this.commands.length - 1; i >= 0; i--) {
            if (!this.commands[i].undo()) {
                allSuccess = false;
            }
        }
        return allSuccess;
    }
    
    getDescription(): string {
        return this.description;
    }
}

// 完整的Invoker：支持历史记录、队列等
class AdvancedCommandInvoker {
    private history: FileCommand[] = [];
    private currentPosition: number = -1;
    private queue: FileCommand[] = [];
    private isProcessing: boolean = false;
    
    // 同步执行
    executeCommand(command: FileCommand): boolean {
        // 清除重做历史
        this.history = this.history.slice(0, this.currentPosition + 1);
        
        const success = command.execute();
        if (success) {
            this.history.push(command);
            this.currentPosition++;
        }
        return success;
    }
    
    // 异步队列执行
    queueCommand(command: FileCommand): void {
        this.queue.push(command);
        console.log(`命令已入队: ${command.getDescription()}`);
        if (!this.isProcessing) {
            this.processQueue();
        }
    }
    
    private async processQueue(): Promise<void> {
        this.isProcessing = true;
        
        while (this.queue.length > 0) {
            const command = this.queue.shift()!;
            console.log(`处理队列命令: ${command.getDescription()}`);
            this.executeCommand(command);
            
            // 模拟异步处理
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        this.isProcessing = false;
        console.log('队列处理完成');
    }
    
    undo(): boolean {
        if (this.currentPosition >= 0) {
            const command = this.history[this.currentPosition];
            const success = command.undo();
            if (success) {
                this.currentPosition--;
            }
            return success;
        } else {
            console.log('没有可撤销的操作');
            return false;
        }
    }
    
    redo(): boolean {
        if (this.currentPosition < this.history.length - 1) {
            this.currentPosition++;
            const command = this.history[this.currentPosition];
            return command.execute();
        } else {
            console.log('没有可重做的操作');
            return false;
        }
    }
    
    getHistory(): string[] {
        return this.history.map(cmd => cmd.getDescription());
    }
    
    showStatus(): void {
        console.log(`历史记录: ${this.history.length} 条`);
        console.log(`当前位置: ${this.currentPosition + 1}`);
        console.log(`队列中: ${this.queue.length} 条`);
    }
}

async function completeExample() {
    console.log('--- 示例3：完整版本（所有组件） ---');
    
    // 创建所有组件
    const fileSystem = new FileSystem();  // Receiver 1
    const logger = new Logger();          // Receiver 2
    const invoker = new AdvancedCommandInvoker();  // Invoker
    
    // Client创建命令并执行
    const commands = [
        new CreateFileCommand(fileSystem, logger, 'readme.md'),
        new CreateFileCommand(fileSystem, logger, 'package.json'),
        new DeleteFileCommand(fileSystem, logger, 'readme.md'),
    ];
    
    // 批量操作
    const batchCreate = new BatchCommand([
        new CreateFileCommand(fileSystem, logger, 'src/index.ts'),
        new CreateFileCommand(fileSystem, logger, 'src/utils.ts'),
        new CreateFileCommand(fileSystem, logger, 'test/index.test.ts')
    ], '创建项目文件');
    
    // 同步执行
    commands.forEach(cmd => invoker.executeCommand(cmd));
    invoker.executeCommand(batchCreate);
    
    console.log('\n当前文件列表:', fileSystem.listFiles());
    invoker.showStatus();
    
    // 撤销操作
    console.log('\n--- 撤销操作 ---');
    invoker.undo();  // 撤销批量创建
    invoker.undo();  // 撤销删除readme.md
    
    console.log('撤销后文件列表:', fileSystem.listFiles());
    
    // 队列操作
    console.log('\n--- 队列操作 ---');
    invoker.queueCommand(new CreateFileCommand(fileSystem, logger, 'docs/api.md'));
    invoker.queueCommand(new CreateFileCommand(fileSystem, logger, 'docs/guide.md'));
    
    // 等待队列处理完成
    await new Promise(resolve => setTimeout(resolve, 600));
    console.log('最终文件列表:', fileSystem.listFiles());
}

// ============== 总结说明 ==============
function summary() {
    console.log('\n=== 核心组件必要性总结 ===');
    console.log(`
📋 组件必要性分析：

✅ 必须有的组件：
• Command接口 - 命令模式的核心抽象
• ConcreteCommand - 具体命令实现，封装请求

🔶 根据需要决定的组件：
• Receiver - 如果命令逻辑简单，可以直接写在Command里
• Invoker - 可以很简单（直接调用），也可以很复杂（历史、队列）
• Client - 总会有，就是使用命令的地方

📈 复杂度递增：
1️⃣ 最简版本：Command + ConcreteCommand
   → 适用于回调函数、事件处理

2️⃣ 简化版本：+ Receiver + 简单Invoker  
   → 适用于需要操作外部对象的场景

3️⃣ 完整版本：+ 复杂Invoker（历史、队列、批量）
   → 适用于复杂业务逻辑

🎯 选择原则：
- 从最简单的开始
- 按需添加组件
- 不要过度设计
    `);
}

// 运行所有示例
export async function runComponentExamples() {
    simpleExample();
    simplifiedExample();
    await completeExample();
    summary();
}

// 如果直接运行文件
if (typeof window === 'undefined') {
    runComponentExamples();
}
