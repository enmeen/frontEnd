/**
 * 命令模式 (Command Pattern)
 * 
 * 定义：将一个请求封装为一个对象，从而使你可用不同的请求对客户进行参数化，
 * 对请求排队或记录请求日志，以及支持可撤销的操作。
 * 
 * 核心组件：
 * 1. Command（命令接口）：声明执行操作的接口
 * 2. ConcreteCommand（具体命令）：实现命令接口，持有接收者的引用
 * 3. Receiver（接收者）：真正执行命令的对象
 * 4. Invoker（调用者）：要求命令执行请求
 * 5. Client（客户端）：创建具体命令对象并设置接收者
 * 
 * 优点：
 * - 降低耦合度：调用者与接收者完全解耦
 * - 支持撤销和重做：可以实现undo/redo功能
 * - 支持宏命令：可以组合多个命令
 * - 支持日志记录：便于记录操作历史
 * - 支持队列操作：可以将命令放入队列中执行
 */

// ============== 基础命令接口 ==============
interface Command {
    execute(): void;
    undo(): void;
    getDescription(): string;
}

// ============== 示例1：文本编辑器命令 ==============

// 接收者：文本编辑器
class TextEditor {
    private content: string = '';
    private cursor: number = 0;

    insertText(text: string, position: number): void {
        this.content = this.content.slice(0, position) + text + this.content.slice(position);
        this.cursor = position + text.length;
        console.log(`插入文本 "${text}" 在位置 ${position}`);
        console.log(`当前内容: "${this.content}"`);
    }

    deleteText(startPos: number, length: number): string {
        const deletedText = this.content.slice(startPos, startPos + length);
        this.content = this.content.slice(0, startPos) + this.content.slice(startPos + length);
        this.cursor = startPos;
        console.log(`删除文本 "${deletedText}" 从位置 ${startPos}`);
        console.log(`当前内容: "${this.content}"`);
        return deletedText;
    }

    getContent(): string {
        return this.content;
    }

    getCursor(): number {
        return this.cursor;
    }
}

// 具体命令：插入文本命令
class InsertTextCommand implements Command {
    private editor: TextEditor;
    private text: string;
    private position: number;

    constructor(editor: TextEditor, text: string, position: number) {
        this.editor = editor;
        this.text = text;
        this.position = position;
    }

    execute(): void {
        this.editor.insertText(this.text, this.position);
    }

    undo(): void {
        this.editor.deleteText(this.position, this.text.length);
    }

    getDescription(): string {
        return `插入 "${this.text}"`;
    }
}

// 具体命令：删除文本命令
class DeleteTextCommand implements Command {
    private editor: TextEditor;
    private startPos: number;
    private length: number;
    private deletedText: string = '';

    constructor(editor: TextEditor, startPos: number, length: number) {
        this.editor = editor;
        this.startPos = startPos;
        this.length = length;
    }

    execute(): void {
        this.deletedText = this.editor.deleteText(this.startPos, this.length);
    }

    undo(): void {
        this.editor.insertText(this.deletedText, this.startPos);
    }

    getDescription(): string {
        return `删除 ${this.length} 个字符`;
    }
}

// 调用者：命令管理器（支持撤销重做）
class CommandManager {
    private history: Command[] = [];
    private currentPosition: number = -1;

    executeCommand(command: Command): void {
        // 执行命令前，清除当前位置之后的历史
        this.history = this.history.slice(0, this.currentPosition + 1);
        
        command.execute();
        this.history.push(command);
        this.currentPosition++;
        
        console.log(`执行命令: ${command.getDescription()}`);
        console.log(`命令历史长度: ${this.history.length}`);
    }

    undo(): void {
        if (this.currentPosition >= 0) {
            const command = this.history[this.currentPosition];
            command.undo();
            this.currentPosition--;
            console.log(`撤销命令: ${command.getDescription()}`);
        } else {
            console.log('没有可撤销的命令');
        }
    }

    redo(): void {
        if (this.currentPosition < this.history.length - 1) {
            this.currentPosition++;
            const command = this.history[this.currentPosition];
            command.execute();
            console.log(`重做命令: ${command.getDescription()}`);
        } else {
            console.log('没有可重做的命令');
        }
    }

    getHistory(): string[] {
        return this.history.map(cmd => cmd.getDescription());
    }
}

// ============== 示例2：家电遥控器 ==============

// 接收者：各种家电
class Light {
    private isOn: boolean = false;
    private location: string;

    constructor(location: string) {
        this.location = location;
    }

    turnOn(): void {
        this.isOn = true;
        console.log(`${this.location}的灯已打开`);
    }

    turnOff(): void {
        this.isOn = false;
        console.log(`${this.location}的灯已关闭`);
    }
}

class AirConditioner {
    private temperature: number = 24;
    private isOn: boolean = false;

    turnOn(): void {
        this.isOn = true;
        console.log(`空调已打开，温度设置为 ${this.temperature}°C`);
    }

    turnOff(): void {
        this.isOn = false;
        console.log('空调已关闭');
    }

    setTemperature(temp: number): void {
        this.temperature = temp;
        console.log(`空调温度设置为 ${temp}°C`);
    }
}

class Television {
    private isOn: boolean = false;
    private channel: number = 1;

    turnOn(): void {
        this.isOn = true;
        console.log(`电视已打开，当前频道 ${this.channel}`);
    }

    turnOff(): void {
        this.isOn = false;
        console.log('电视已关闭');
    }

    changeChannel(channel: number): void {
        this.channel = channel;
        console.log(`电视频道切换到 ${channel}`);
    }
}

// 具体命令：家电控制命令
class LightOnCommand implements Command {
    private light: Light;

    constructor(light: Light) {
        this.light = light;
    }

    execute(): void {
        this.light.turnOn();
    }

    undo(): void {
        this.light.turnOff();
    }

    getDescription(): string {
        return '开灯';
    }
}

class LightOffCommand implements Command {
    private light: Light;

    constructor(light: Light) {
        this.light = light;
    }

    execute(): void {
        this.light.turnOff();
    }

    undo(): void {
        this.light.turnOn();
    }

    getDescription(): string {
        return '关灯';
    }
}

class AirConditionerOnCommand implements Command {
    private ac: AirConditioner;

    constructor(ac: AirConditioner) {
        this.ac = ac;
    }

    execute(): void {
        this.ac.turnOn();
    }

    undo(): void {
        this.ac.turnOff();
    }

    getDescription(): string {
        return '开空调';
    }
}

// 空命令（Null Object Pattern）
class NoCommand implements Command {
    execute(): void {
        // 什么都不做
    }

    undo(): void {
        // 什么都不做
    }

    getDescription(): string {
        return '空命令';
    }
}

// 宏命令：组合多个命令
class MacroCommand implements Command {
    private commands: Command[];
    private description: string;

    constructor(commands: Command[], description: string) {
        this.commands = commands;
        this.description = description;
    }

    execute(): void {
        console.log(`执行宏命令: ${this.description}`);
        for (const command of this.commands) {
            command.execute();
        }
    }

    undo(): void {
        console.log(`撤销宏命令: ${this.description}`);
        // 逆序撤销所有命令
        for (let i = this.commands.length - 1; i >= 0; i--) {
            this.commands[i].undo();
        }
    }

    getDescription(): string {
        return this.description;
    }
}

// 调用者：万能遥控器
class UniversalRemote {
    private onCommands: Command[] = [];
    private offCommands: Command[] = [];
    private lastCommand: Command;

    constructor() {
        const noCommand = new NoCommand();
        for (let i = 0; i < 7; i++) {
            this.onCommands[i] = noCommand;
            this.offCommands[i] = noCommand;
        }
        this.lastCommand = noCommand;
    }

    setCommand(slot: number, onCommand: Command, offCommand: Command): void {
        this.onCommands[slot] = onCommand;
        this.offCommands[slot] = offCommand;
    }

    onButtonPressed(slot: number): void {
        this.onCommands[slot].execute();
        this.lastCommand = this.onCommands[slot];
    }

    offButtonPressed(slot: number): void {
        this.offCommands[slot].execute();
        this.lastCommand = this.offCommands[slot];
    }

    undoButtonPressed(): void {
        this.lastCommand.undo();
    }

    toString(): string {
        let result = '\n------ 万能遥控器 ------\n';
        for (let i = 0; i < this.onCommands.length; i++) {
            result += `[插槽 ${i}] ${this.onCommands[i].getDescription()}    ${this.offCommands[i].getDescription()}\n`;
        }
        return result;
    }
}

// ============== 使用示例 ==============

// 文本编辑器示例
function textEditorExample(): void {
    console.log('\n=== 文本编辑器命令模式示例 ===');
    
    const editor = new TextEditor();
    const commandManager = new CommandManager();

    // 执行一系列编辑操作
    const insertHello = new InsertTextCommand(editor, 'Hello', 0);
    const insertWorld = new InsertTextCommand(editor, ' World', 5);
    const insertExclamation = new InsertTextCommand(editor, '!', 11);
    
    commandManager.executeCommand(insertHello);
    commandManager.executeCommand(insertWorld);
    commandManager.executeCommand(insertExclamation);

    console.log('\n--- 开始撤销操作 ---');
    commandManager.undo(); // 撤销感叹号
    commandManager.undo(); // 撤销World

    console.log('\n--- 开始重做操作 ---');
    commandManager.redo(); // 重做World

    console.log('\n--- 继续编辑 ---');
    const deleteCommand = new DeleteTextCommand(editor, 0, 5);
    commandManager.executeCommand(deleteCommand);

    console.log('\n命令历史:', commandManager.getHistory());
}

// 家电遥控器示例
function remoteControlExample(): void {
    console.log('\n=== 家电遥控器命令模式示例 ===');

    const remote = new UniversalRemote();

    // 创建家电设备
    const livingRoomLight = new Light('客厅');
    const bedroomLight = new Light('卧室');
    const airConditioner = new AirConditioner();
    const tv = new Television();

    // 创建命令
    const livingRoomLightOn = new LightOnCommand(livingRoomLight);
    const livingRoomLightOff = new LightOffCommand(livingRoomLight);
    const bedroomLightOn = new LightOnCommand(bedroomLight);
    const bedroomLightOff = new LightOffCommand(bedroomLight);
    const acOn = new AirConditionerOnCommand(airConditioner);

    // 设置遥控器按钮
    remote.setCommand(0, livingRoomLightOn, livingRoomLightOff);
    remote.setCommand(1, bedroomLightOn, bedroomLightOff);
    remote.setCommand(2, acOn, new NoCommand());

    console.log(remote.toString());

    // 测试按钮操作
    console.log('\n--- 按按钮测试 ---');
    remote.onButtonPressed(0);
    remote.offButtonPressed(0);
    remote.onButtonPressed(1);
    remote.onButtonPressed(2);

    console.log('\n--- 撤销最后一个操作 ---');
    remote.undoButtonPressed();

    // 宏命令示例：回家场景
    console.log('\n--- 宏命令示例：回家场景 ---');
    const homeCommands = [
        new LightOnCommand(livingRoomLight),
        new LightOnCommand(bedroomLight),
        new AirConditionerOnCommand(airConditioner)
    ];
    const homeScenario = new MacroCommand(homeCommands, '回家场景');
    
    homeScenario.execute();
    
    console.log('\n--- 撤销回家场景 ---');
    homeScenario.undo();
}

// ============== 高级应用：队列命令处理器 ==============
class CommandQueue {
    private queue: Command[] = [];
    private isProcessing: boolean = false;

    addCommand(command: Command): void {
        this.queue.push(command);
        console.log(`命令 "${command.getDescription()}" 已加入队列`);
        
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    private async processQueue(): Promise<void> {
        this.isProcessing = true;
        
        while (this.queue.length > 0) {
            const command = this.queue.shift();
            if (command) {
                console.log(`正在处理命令: ${command.getDescription()}`);
                command.execute();
                
                // 模拟异步处理时间
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        this.isProcessing = false;
        console.log('队列处理完成');
    }
}

// 队列处理示例
async function queueExample(): Promise<void> {
    console.log('\n=== 命令队列处理示例 ===');
    
    const queue = new CommandQueue();
    const light = new Light('测试灯');
    
    // 快速添加多个命令
    queue.addCommand(new LightOnCommand(light));
    queue.addCommand(new LightOffCommand(light));
    queue.addCommand(new LightOnCommand(light));
    
    // 等待处理完成
    await new Promise(resolve => setTimeout(resolve, 500));
}

// ============== 导出和测试 ==============
export {
    Command,
    TextEditor,
    CommandManager,
    InsertTextCommand,
    DeleteTextCommand,
    UniversalRemote,
    MacroCommand,
    CommandQueue
};

// 运行所有示例
function runAllExamples(): void {
    textEditorExample();
    remoteControlExample();
    queueExample();
}

// 如果直接运行此文件，则执行示例
// 注释掉 Node.js 特定的代码，改为导出运行函数
// if (require.main === module) {
//     runAllExamples();
// }

// 在浏览器或其他环境中可以手动调用
export { runAllExamples };
