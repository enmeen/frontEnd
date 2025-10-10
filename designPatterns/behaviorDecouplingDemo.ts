/**
 * 行为请求者与行为实现者的解耦示例
 * 展示命令模式如何解决紧耦合问题
 */

// ============== 传统紧耦合方式 ==============

// 行为实现者：文本编辑器
class TightTextEditor {
    private content: string = '';
    
    insertText(text: string, position: number): void {
        this.content = this.content.slice(0, position) + text + this.content.slice(position);
        console.log(`插入文本: ${text}`);
    }
    
    deleteText(startPos: number, length: number): void {
        this.content = this.content.slice(0, startPos) + this.content.slice(startPos + length);
        console.log(`删除文本`);
    }
    
    getContent(): string {
        return this.content;
    }
}

// 行为请求者：工具栏（紧耦合版本）
class TightlyeCoupledToolbar {
    private editor: TightTextEditor;
    private operationHistory: string[] = []; // 无法真正实现撤销
    
    constructor(editor: TightTextEditor) {
        this.editor = editor; // 直接依赖具体实现！
    }
    
    // ❌ 问题1：直接调用实现者，无法记录操作历史
    onInsertButtonClick(): void {
        this.editor.insertText('Hello', 0);
        this.operationHistory.push('insert'); // 只能记录操作名称，无法撤销
    }
    
    onDeleteButtonClick(): void {
        this.editor.deleteText(0, 5);
        this.operationHistory.push('delete'); // 无法恢复删除的内容
    }
    
    // ❌ 问题2：无法真正实现撤销，因为不知道如何逆转操作
    onUndoButtonClick(): void {
        if (this.operationHistory.length > 0) {
            const lastOp = this.operationHistory.pop();
            console.log(`尝试撤销 ${lastOp}，但不知道怎么做...`);
            // 这里无法真正撤销，因为没有保存足够的信息
        }
    }
    
    // ❌ 问题3：要支持新的行为实现者，必须修改这个类
    // 如果要支持富文本编辑器、表格编辑器等，需要大量修改
}

console.log('=== 紧耦合方式的问题演示 ===');
const tightEditor = new TightTextEditor();
const tightToolbar = new TightlyeCoupledToolbar(tightEditor);

tightToolbar.onInsertButtonClick();
tightToolbar.onDeleteButtonClick();
tightToolbar.onUndoButtonClick(); // 无法真正撤销

console.log('问题总结：');
console.log('1. 无法记录完整的操作信息');
console.log('2. 无法实现真正的撤销功能');
console.log('3. 无法支持事务和批处理');
console.log('4. 难以扩展和维护');

// ============== 命令模式解耦方式 ==============

// 命令接口：解耦的桥梁
interface Command {
    execute(): void;
    undo(): void;
    getDescription(): string;
    canUndo(): boolean;
}

// 行为实现者：文本编辑器（与命令模式版本相同）
class DecoupledTextEditor {
    private content: string = '';
    
    insertText(text: string, position: number): void {
        this.content = this.content.slice(0, position) + text + this.content.slice(position);
        console.log(`📝 插入文本: "${text}" -> 当前内容: "${this.content}"`);
    }
    
    deleteText(startPos: number, length: number): string {
        const deletedText = this.content.slice(startPos, startPos + length);
        this.content = this.content.slice(0, startPos) + this.content.slice(startPos + length);
        console.log(`🗑️  删除文本: "${deletedText}" -> 当前内容: "${this.content}"`);
        return deletedText;
    }
    
    getContent(): string {
        return this.content;
    }
}

// 具体命令：插入文本命令
class InsertCommand implements Command {
    constructor(
        private editor: DecoupledTextEditor, // 持有行为实现者的引用
        private text: string,
        private position: number
    ) {}
    
    execute(): void {
        this.editor.insertText(this.text, this.position);
    }
    
    undo(): void {
        // 撤销插入 = 删除插入的内容
        this.editor.deleteText(this.position, this.text.length);
    }
    
    getDescription(): string {
        return `插入 "${this.text}"`;
    }
    
    canUndo(): boolean {
        return true;
    }
}

// 具体命令：删除文本命令
class DeleteCommand implements Command {
    private deletedText: string = '';
    
    constructor(
        private editor: DecoupledTextEditor,
        private startPos: number,
        private length: number
    ) {}
    
    execute(): void {
        this.deletedText = this.editor.deleteText(this.startPos, this.length);
    }
    
    undo(): void {
        // 撤销删除 = 重新插入删除的内容
        this.editor.insertText(this.deletedText, this.startPos);
    }
    
    getDescription(): string {
        return `删除 ${this.length} 个字符`;
    }
    
    canUndo(): boolean {
        return this.deletedText !== '';
    }
}

// 事务命令：组合多个操作为原子操作
class TransactionCommand implements Command {
    private executedCommands: Command[] = [];
    
    constructor(
        private commands: Command[],
        private description: string
    ) {}
    
    execute(): void {
        console.log(`🔄 开始事务: ${this.description}`);
        
        for (const command of this.commands) {
            try {
                command.execute();
                this.executedCommands.push(command);
            } catch (error) {
                // 如果任何命令失败，回滚所有已执行的命令
                console.log('❌ 事务执行失败，开始回滚...');
                this.undo();
                throw error;
            }
        }
        
        console.log(`✅ 事务完成: ${this.description}`);
    }
    
    undo(): void {
        console.log(`🔙 回滚事务: ${this.description}`);
        
        // 逆序撤销所有已执行的命令
        for (let i = this.executedCommands.length - 1; i >= 0; i--) {
            if (this.executedCommands[i].canUndo()) {
                this.executedCommands[i].undo();
            }
        }
        
        this.executedCommands = [];
    }
    
    getDescription(): string {
        return `事务: ${this.description}`;
    }
    
    canUndo(): boolean {
        return this.executedCommands.length > 0;
    }
}

// 行为请求者：解耦的工具栏
class DecoupledToolbar {
    private commandHistory: Command[] = [];
    private currentPosition: number = -1;
    
    // ✅ 优点1：不直接依赖行为实现者，只依赖Command接口
    constructor() {
        console.log('🛠️  工具栏初始化完成，支持撤销/重做');
    }
    
    // ✅ 优点2：可以执行任何命令，不限于特定的行为实现者
    executeCommand(command: Command): void {
        // 清除当前位置之后的历史（如果用户在中间位置执行新命令）
        this.commandHistory = this.commandHistory.slice(0, this.currentPosition + 1);
        
        try {
            command.execute();
            this.commandHistory.push(command);
            this.currentPosition++;
            
            console.log(`✅ 执行成功: ${command.getDescription()}`);
            console.log(`📊 历史记录: ${this.commandHistory.length} 条，当前位置: ${this.currentPosition + 1}`);
        } catch (error) {
            console.log(`❌ 执行失败: ${command.getDescription()}`, error);
        }
    }
    
    // ✅ 优点3：真正的撤销功能
    undo(): boolean {
        if (this.currentPosition >= 0) {
            const command = this.commandHistory[this.currentPosition];
            
            if (command.canUndo()) {
                command.undo();
                this.currentPosition--;
                console.log(`↩️  撤销成功: ${command.getDescription()}`);
                return true;
            } else {
                console.log(`⚠️  无法撤销: ${command.getDescription()}`);
            }
        } else {
            console.log('ℹ️  没有可撤销的操作');
        }
        return false;
    }
    
    // ✅ 优点4：重做功能
    redo(): boolean {
        if (this.currentPosition < this.commandHistory.length - 1) {
            this.currentPosition++;
            const command = this.commandHistory[this.currentPosition];
            
            command.execute();
            console.log(`↪️  重做成功: ${command.getDescription()}`);
            return true;
        } else {
            console.log('ℹ️  没有可重做的操作');
        }
        return false;
    }
    
    // ✅ 优点5：批处理和事务支持
    executeTransaction(commands: Command[], description: string): void {
        const transaction = new TransactionCommand(commands, description);
        this.executeCommand(transaction);
    }
    
    // 查看历史
    showHistory(): void {
        console.log('\n📋 操作历史:');
        this.commandHistory.forEach((cmd, index) => {
            const marker = index === this.currentPosition ? '👉' : '  ';
            console.log(`${marker} ${index + 1}. ${cmd.getDescription()}`);
        });
        console.log();
    }
}

// ============== 解耦方式的使用演示 ==============

function demonstrateDecoupling() {
    console.log('\n=== 命令模式解耦方式演示 ===');
    
    // 创建行为实现者
    const editor = new DecoupledTextEditor();
    
    // 创建行为请求者
    const toolbar = new DecoupledToolbar();
    
    console.log('\n--- 1. 基本操作 ---');
    // 行为请求者通过命令与行为实现者交互
    toolbar.executeCommand(new InsertCommand(editor, 'Hello', 0));
    toolbar.executeCommand(new InsertCommand(editor, ' World', 5));
    toolbar.executeCommand(new DeleteCommand(editor, 0, 3)); // 删除 "Hel"
    
    console.log('\n--- 2. 撤销操作 ---');
    toolbar.undo(); // 撤销删除
    toolbar.undo(); // 撤销插入 " World"
    
    console.log('\n--- 3. 重做操作 ---');
    toolbar.redo(); // 重做插入 " World"
    
    console.log('\n--- 4. 事务操作 ---');
    toolbar.executeTransaction([
        new InsertCommand(editor, '!', editor.getContent().length),
        new InsertCommand(editor, '!', editor.getContent().length + 1),
        new InsertCommand(editor, '!', editor.getContent().length + 2)
    ], '添加三个感叹号');
    
    toolbar.showHistory();
    
    console.log('\n--- 5. 撤销整个事务 ---');
    toolbar.undo(); // 撤销整个事务，三个感叹号一起被移除
    
    console.log(`\n🎯 最终内容: "${editor.getContent()}"`);
}

// ============== 对比总结 ==============

function compareApproaches() {
    console.log('\n=== 对比总结 ===');
    console.log(`
📊 紧耦合 vs 命令模式对比：

❌ 紧耦合问题：
• 行为请求者直接依赖行为实现者
• 无法记录完整的操作信息
• 难以实现撤销/重做
• 不支持事务和批处理
• 扩展性差，修改困难

✅ 命令模式优势：
• 请求者与实现者完全解耦
• 完整记录操作信息和参数
• 轻松实现撤销/重做
• 支持事务和批处理
• 易于扩展，支持新的命令类型

🎯 核心组件对应关系：
• 行为请求者 ←→ Invoker (调用者)
• 行为实现者 ←→ Receiver (接收者)  
• Command ←→ 解耦的桥梁
• Client ←→ 组装命令的代码

💡 使用场景：
• 需要撤销/重做功能
• 需要记录操作日志
• 需要事务支持
• 需要批处理操作
• 需要延迟执行
• 需要操作排队
    `);
}

// 运行演示
export function runDecouplingDemo() {
    demonstrateDecoupling();
    compareApproaches();
}

// 直接运行
if (typeof window === 'undefined') {
    runDecouplingDemo();
}
