/**
 * 命令模式的正确执行顺序演示
 * 纠正"调用者→接受者→命令"的错误理解
 */

// 模拟命令模式的执行流程
console.log('=== 命令模式的正确执行顺序 ===\n');

// 接收者（Receiver）
class TextEditor {
    private content: string = '';
    
    insertText(text: string): void {
        this.content += text;
        console.log(`📝 接收者执行: 插入文本 "${text}"`);
        console.log(`   当前内容: "${this.content}"`);
    }
}

// 命令（Command）
class InsertCommand {
    constructor(
        private receiver: TextEditor,
        private text: string
    ) {}
    
    execute(): void {
        console.log(`⚡ 命令开始执行: 插入命令`);
        console.log(`   准备调用接收者...`);
        
        // 命令调用接收者
        this.receiver.insertText(this.text);
        
        console.log(`✅ 命令执行完成\n`);
    }
}

// 调用者（Invoker）
class CommandManager {
    executeCommand(command: InsertCommand): void {
        console.log(`🎯 调用者开始工作: CommandManager`);
        console.log(`   准备执行命令...`);
        
        // 调用者调用命令
        command.execute();
        
        console.log(`🏁 调用者工作完成\n`);
    }
}

// 客户端代码演示正确的执行流程
function demonstrateCorrectOrder() {
    console.log('--- 第1步：客户端创建组件 ---');
    
    // 1. 创建接收者
    const editor = new TextEditor();
    console.log('✓ 创建接收者: TextEditor\n');
    
    // 2. 创建命令（将接收者传给命令）
    const command = new InsertCommand(editor, 'Hello World');
    console.log('✓ 创建命令: InsertCommand（已绑定接收者）\n');
    
    // 3. 创建调用者
    const manager = new CommandManager();
    console.log('✓ 创建调用者: CommandManager\n');
    
    console.log('--- 第2步：执行过程 ---');
    console.log('正确的执行顺序: 调用者 → 命令 → 接收者\n');
    
    // 4. 调用者执行命令
    manager.executeCommand(command);
}

// 错误理解的演示（这种情况不存在）
function demonstrateWrongUnderstanding() {
    console.log('=== 错误理解的分析 ===\n');
    console.log('❌ 错误顺序: "调用者→接收者→命令" 意味着:');
    console.log('   1. 调用者直接调用接收者');
    console.log('   2. 然后接收者再调用命令');
    console.log('   3. 这样就不是命令模式了！\n');
    
    console.log('🤔 这种错误理解的问题:');
    console.log('   • 调用者直接知道接收者 = 紧耦合');
    console.log('   • 接收者调用命令 = 职责颠倒');
    console.log('   • 完全失去了命令模式的解耦优势\n');
}

// 用流程图方式展示
function showFlowDiagram() {
    console.log('=== 流程图对比 ===\n');
    
    console.log('✅ 正确的命令模式流程:');
    console.log(`
    Client (客户端)
         ↓ 创建
    ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
    │   Invoker   │─────→│   Command   │─────→│  Receiver   │
    │  (调用者)   │ 调用 │   (命令)    │ 调用 │ (接收者)    │
    └─────────────┘      └─────────────┘      └─────────────┘
         管理                  封装                  执行
         命令                请求+参数            具体行为
    `);
    
    console.log('❌ 错误理解的流程:');
    console.log(`
    ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
    │   Invoker   │─────→│  Receiver   │─────→│   Command   │
    │  (调用者)   │ 直接 │ (接收者)    │ ??? │   (命令)    │
    └─────────────┘ 调用 └─────────────┘     └─────────────┘
                        这样就紧耦合了！    接收者为什么要调用命令？
    `);
}

// 详细的执行步骤分析
function detailedExecutionAnalysis() {
    console.log('=== 详细执行步骤分析 ===\n');
    
    console.log('📋 正确的执行步骤:');
    console.log('1. Client 创建 Receiver 实例');
    console.log('2. Client 创建 Command 实例（将 Receiver 传入）');
    console.log('3. Client 将 Command 传给 Invoker');
    console.log('4. Invoker 调用 command.execute()');
    console.log('5. Command 内部调用 receiver.doSomething()');
    console.log('6. Receiver 执行具体的业务逻辑\n');
    
    console.log('🎯 关键理解:');
    console.log('• Invoker 不知道 Receiver 的存在');
    console.log('• Receiver 不知道 Invoker 的存在');
    console.log('• Command 是两者之间的桥梁');
    console.log('• 调用链: Invoker → Command → Receiver\n');
}

// 实际代码示例验证
function verifyWithCode() {
    console.log('=== 代码验证 ===\n');
    
    // 模拟具体的调用过程
    class Light {
        turnOn(): void {
            console.log('💡 Light (接收者): 灯已打开');
        }
    }
    
    class LightOnCommand {
        constructor(private light: Light) {}
        
        execute(): void {
            console.log('⚡ LightOnCommand (命令): 开始执行...');
            this.light.turnOn(); // 命令调用接收者
            console.log('✅ LightOnCommand (命令): 执行完成');
        }
    }
    
    class RemoteControl {
        private command?: LightOnCommand;
        
        setCommand(command: LightOnCommand): void {
            this.command = command;
        }
        
        pressButton(): void {
            console.log('🎛️  RemoteControl (调用者): 按钮被按下');
            if (this.command) {
                this.command.execute(); // 调用者调用命令
            }
            console.log('🏁 RemoteControl (调用者): 操作完成');
        }
    }
    
    console.log('实际执行过程:');
    const light = new Light();
    const command = new LightOnCommand(light);
    const remote = new RemoteControl();
    
    remote.setCommand(command);
    remote.pressButton();
    
    console.log('\n观察输出顺序，验证调用链: RemoteControl → LightOnCommand → Light');
}

// 运行所有演示
function runOrderCorrection() {
    demonstrateCorrectOrder();
    demonstrateWrongUnderstanding();
    showFlowDiagram();
    detailedExecutionAnalysis();
    verifyWithCode();
    
    console.log('\n🎯 结论:');
    console.log('正确的顺序是: 调用者 → 命令 → 接收者');
    console.log('而不是: 调用者 → 接收者 → 命令');
}

export { runOrderCorrection };

// 直接运行
if (typeof window === 'undefined') {
    runOrderCorrection();
}
