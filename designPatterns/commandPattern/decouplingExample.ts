/**
 * 解耦关系详解示例
 */

// 导入必要的接口
interface Command {
    execute(): void;
    undo(): void;
    getDescription(): string;
}

// 模拟数据库类
class Database {
    save(data: any): void {
        console.log('保存数据到数据库');
    }
}

// === 没有命令模式的耦合代码 ===
class TightlyCoupledInvoker {
    constructor(
        private textEditor: TextEditor,
        private fileSystem: FileSystem,
        private database: Database
    ) {}
    
    // 调用者直接知道所有接收者！耦合度很高
    handleUserAction(action: string) {
        if (action === 'insertText') {
            this.textEditor.insertText('Hello', 0); // 直接调用接收者
        } else if (action === 'saveFile') {
            this.fileSystem.saveFile('data.txt'); // 直接调用接收者
        } else if (action === 'saveData') {
            this.database.save({id: 1}); // 直接调用接收者
        }
        // 要支持新的接收者？必须修改这个类！
    }
}

// === 使用命令模式的解耦代码 ===
class DecoupledInvoker {
    // 调用者只知道Command接口，不知道任何具体的接收者
    executeCommand(command: Command): void {
        command.execute(); // 完全不知道command内部做了什么
    }
    
    // 要支持新的接收者？不需要修改这个类！
}

// 命令知道接收者，但接收者不知道命令
class InsertTextCommand implements Command {
    constructor(
        private editor: TextEditor, // 命令持有接收者引用
        private text: string,
        private position: number
    ) {}
    
    execute(): void {
        // 命令调用接收者，接收者不知道是谁调用的
        this.editor.insertText(this.text, this.position);
    }
    
    undo(): void {
        this.editor.deleteText(this.position, this.text.length);
    }
    
    getDescription(): string {
        return `插入 "${this.text}"`;
    }
}

class SaveFileCommand implements Command {
    constructor(
        private fileSystem: FileSystem, // 不同的接收者
        private filename: string
    ) {}
    
    execute(): void {
        this.fileSystem.saveFile(this.filename);
    }
    
    undo(): void {
        this.fileSystem.deleteFile(this.filename);
    }
    
    getDescription(): string {
        return `保存文件 "${this.filename}"`;
    }
}

// 接收者完全不知道命令和调用者的存在
class TextEditor {
    private content: string = '';
    
    insertText(text: string, position: number): void {
        this.content = this.content.slice(0, position) + text + this.content.slice(position);
        console.log(`插入文本: ${text}，当前内容: "${this.content}"`);
    }
    
    deleteText(startPos: number, length: number): void {
        this.content = this.content.slice(0, startPos) + this.content.slice(startPos + length);
        console.log(`删除文本，当前内容: "${this.content}"`);
    }
}

class FileSystem {
    private files: Set<string> = new Set();
    
    saveFile(filename: string): void {
        this.files.add(filename);
        console.log(`保存文件: ${filename}`);
    }
    
    deleteFile(filename: string): void {
        this.files.delete(filename);
        console.log(`删除文件: ${filename}`);
    }
}

// === 使用示例：展示解耦的威力 ===
function demonstrateDecoupling() {
    const invoker = new DecoupledInvoker();
    
    // 创建不同的接收者
    const editor = new TextEditor();
    const fileSystem = new FileSystem();
    
    // 创建不同的命令（Client的工作）
    const commands = [
        new InsertTextCommand(editor, 'Hello', 0),
        new SaveFileCommand(fileSystem, 'data.txt'),
        // 可以轻松添加新的命令，invoker不需要改变
    ];
    
    // 调用者统一处理，不管具体是什么命令
    commands.forEach(cmd => invoker.executeCommand(cmd));
}

// === 解耦的好处：可扩展性 ===
// 新增一个接收者和命令，调用者完全不需要修改
class EmailService {
    sendEmail(to: string, subject: string): void {
        console.log(`发送邮件给 ${to}: ${subject}`);
    }
}

class SendEmailCommand implements Command {
    constructor(
        private emailService: EmailService,
        private to: string,
        private subject: string
    ) {}
    
    execute(): void {
        this.emailService.sendEmail(this.to, this.subject);
    }
    
    undo(): void {
        // 邮件无法撤销，但可以发送撤销通知
        console.log('无法撤销邮件，但已记录操作');
    }
    
    getDescription(): string {
        return `发送邮件给 ${this.to}`;
    }
}

// 原来的调用者代码不用改，直接支持新功能！
function extendedExample() {
    const invoker = new DecoupledInvoker();
    const emailService = new EmailService();
    
    const emailCommand = new SendEmailCommand(
        emailService, 
        'user@example.com', 
        '欢迎使用系统'
    );
    
    // 调用者代码完全没有变化
    invoker.executeCommand(emailCommand);
}

export { 
    DecoupledInvoker, 
    InsertTextCommand, 
    SaveFileCommand, 
    SendEmailCommand,
    demonstrateDecoupling, 
    extendedExample 
};
