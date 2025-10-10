/**
 * 宏命令的更多应用场景示例
 * 展示原子性操作的强大之处
 */

interface Command {
    execute(): boolean;
    undo(): boolean;
    getDescription(): string;
}

// ============== 场景1：数据库事务操作 ==============
class DatabaseService {
    private tables: Map<string, any[]> = new Map();
    
    insertRecord(table: string, record: any): boolean {
        if (!this.tables.has(table)) {
            this.tables.set(table, []);
        }
        this.tables.get(table)!.push(record);
        console.log(`插入记录到 ${table}: ${JSON.stringify(record)}`);
        return true;
    }
    
    deleteRecord(table: string, id: number): boolean {
        const records = this.tables.get(table);
        if (records) {
            const index = records.findIndex(r => r.id === id);
            if (index >= 0) {
                const deleted = records.splice(index, 1)[0];
                console.log(`从 ${table} 删除记录: ${JSON.stringify(deleted)}`);
                return true;
            }
        }
        return false;
    }
    
    updateRecord(table: string, id: number, newData: any): any {
        const records = this.tables.get(table);
        if (records) {
            const record = records.find(r => r.id === id);
            if (record) {
                const oldData = { ...record };
                Object.assign(record, newData);
                console.log(`更新 ${table} 记录 ID ${id}: ${JSON.stringify(newData)}`);
                return oldData;
            }
        }
        return null;
    }
}

// 数据库命令
class InsertCommand implements Command {
    constructor(
        private db: DatabaseService,
        private table: string,
        private record: any
    ) {}
    
    execute(): boolean {
        return this.db.insertRecord(this.table, this.record);
    }
    
    undo(): boolean {
        return this.db.deleteRecord(this.table, this.record.id);
    }
    
    getDescription(): string {
        return `插入记录到 ${this.table}`;
    }
}

class UpdateCommand implements Command {
    private oldData: any = null;
    
    constructor(
        private db: DatabaseService,
        private table: string,
        private id: number,
        private newData: any
    ) {}
    
    execute(): boolean {
        this.oldData = this.db.updateRecord(this.table, this.id, this.newData);
        return this.oldData !== null;
    }
    
    undo(): boolean {
        if (this.oldData) {
            this.db.updateRecord(this.table, this.id, this.oldData);
            return true;
        }
        return false;
    }
    
    getDescription(): string {
        return `更新 ${this.table} 记录 ID ${this.id}`;
    }
}

// 数据库事务宏命令（原子性！）
class DatabaseTransactionCommand implements Command {
    private commands: Command[];
    private executedCommands: Command[] = [];
    
    constructor(commands: Command[], private description: string) {
        this.commands = commands;
    }
    
    execute(): boolean {
        console.log(`🔄 开始执行事务: ${this.description}`);
        
        // 尝试执行所有命令
        for (const command of this.commands) {
            if (command.execute()) {
                this.executedCommands.push(command);
                console.log(`✅ ${command.getDescription()} 成功`);
            } else {
                // 如果任何一个失败，回滚所有已执行的命令
                console.log(`❌ ${command.getDescription()} 失败，开始回滚...`);
                this.rollback();
                return false;
            }
        }
        
        console.log(`🎉 事务完成: ${this.description}`);
        return true;
    }
    
    undo(): boolean {
        return this.rollback();
    }
    
    private rollback(): boolean {
        console.log(`🔙 回滚事务: ${this.description}`);
        
        // 逆序撤销所有已执行的命令
        for (let i = this.executedCommands.length - 1; i >= 0; i--) {
            const command = this.executedCommands[i];
            if (command.undo()) {
                console.log(`↩️  撤销 ${command.getDescription()} 成功`);
            } else {
                console.log(`⚠️  撤销 ${command.getDescription()} 失败`);
            }
        }
        
        this.executedCommands = [];
        console.log(`✅ 事务回滚完成`);
        return true;
    }
    
    getDescription(): string {
        return this.description;
    }
}

// ============== 场景2：文件批处理操作 ==============
class FileSystemService {
    private files: Set<string> = new Set();
    private backups: Map<string, string> = new Map();
    
    createFile(filename: string, content: string = ''): boolean {
        if (this.files.has(filename)) {
            console.log(`文件已存在: ${filename}`);
            return false;
        }
        this.files.add(filename);
        console.log(`创建文件: ${filename}`);
        return true;
    }
    
    deleteFile(filename: string): boolean {
        if (this.files.has(filename)) {
            this.files.delete(filename);
            console.log(`删除文件: ${filename}`);
            return true;
        }
        return false;
    }
    
    moveFile(from: string, to: string): boolean {
        if (this.files.has(from) && !this.files.has(to)) {
            this.files.delete(from);
            this.files.add(to);
            console.log(`移动文件: ${from} → ${to}`);
            return true;
        }
        return false;
    }
    
    backupFile(filename: string): boolean {
        if (this.files.has(filename)) {
            this.backups.set(filename, `${filename}.backup`);
            console.log(`备份文件: ${filename}`);
            return true;
        }
        return false;
    }
    
    restoreFile(filename: string): boolean {
        const backupName = this.backups.get(filename);
        if (backupName) {
            this.backups.delete(filename);
            console.log(`恢复文件: ${filename}`);
            return true;
        }
        return false;
    }
}

// 文件操作命令
class CreateFileCommand implements Command {
    constructor(
        private fs: FileSystemService,
        private filename: string,
        private content: string = ''
    ) {}
    
    execute(): boolean {
        return this.fs.createFile(this.filename, this.content);
    }
    
    undo(): boolean {
        return this.fs.deleteFile(this.filename);
    }
    
    getDescription(): string {
        return `创建文件 ${this.filename}`;
    }
}

class MoveFileCommand implements Command {
    constructor(
        private fs: FileSystemService,
        private from: string,
        private to: string
    ) {}
    
    execute(): boolean {
        return this.fs.moveFile(this.from, this.to);
    }
    
    undo(): boolean {
        return this.fs.moveFile(this.to, this.from);
    }
    
    getDescription(): string {
        return `移动文件 ${this.from} → ${this.to}`;
    }
}

class BackupFileCommand implements Command {
    constructor(
        private fs: FileSystemService,
        private filename: string
    ) {}
    
    execute(): boolean {
        return this.fs.backupFile(this.filename);
    }
    
    undo(): boolean {
        return this.fs.restoreFile(this.filename);
    }
    
    getDescription(): string {
        return `备份文件 ${this.filename}`;
    }
}

// 项目部署宏命令（原子性！）
class DeployProjectCommand implements Command {
    private commands: Command[];
    private executedCommands: Command[] = [];
    
    constructor(commands: Command[]) {
        this.commands = commands;
    }
    
    execute(): boolean {
        console.log(`🚀 开始项目部署...`);
        
        for (const command of this.commands) {
            if (command.execute()) {
                this.executedCommands.push(command);
            } else {
                console.log(`💥 部署失败，回滚所有操作...`);
                this.undo();
                return false;
            }
        }
        
        console.log(`🎊 项目部署成功！`);
        return true;
    }
    
    undo(): boolean {
        console.log(`🔄 回滚项目部署...`);
        
        // 逆序撤销
        for (let i = this.executedCommands.length - 1; i >= 0; i--) {
            this.executedCommands[i].undo();
        }
        
        this.executedCommands = [];
        console.log(`✅ 项目回滚完成`);
        return true;
    }
    
    getDescription(): string {
        return '项目部署';
    }
}

// ============== 使用示例 ==============

function databaseTransactionExample() {
    console.log('\n=== 数据库事务宏命令示例 ===');
    
    const db = new DatabaseService();
    
    // 创建一个用户注册事务（原子性操作）
    const userRegistration = new DatabaseTransactionCommand([
        new InsertCommand(db, 'users', { id: 1, name: 'Alice', email: 'alice@example.com' }),
        new InsertCommand(db, 'profiles', { id: 1, userId: 1, avatar: 'avatar1.jpg' }),
        new UpdateCommand(db, 'counters', 1, { userCount: 1001 })
    ], '用户注册事务');
    
    // 执行事务
    const success = userRegistration.execute();
    
    if (success) {
        console.log('\n--- 手动撤销整个事务 ---');
        userRegistration.undo();
    }
}

function deploymentExample() {
    console.log('\n=== 项目部署宏命令示例 ===');
    
    const fs = new FileSystemService();
    
    // 项目部署宏命令（原子性操作）
    const deployment = new DeployProjectCommand([
        new BackupFileCommand(fs, 'app.js'),           // 1. 备份旧版本
        new CreateFileCommand(fs, 'app.v2.js'),       // 2. 创建新版本
        new MoveFileCommand(fs, 'app.js', 'app.old.js'), // 3. 移动旧版本
        new MoveFileCommand(fs, 'app.v2.js', 'app.js'),  // 4. 部署新版本
    ]);
    
    // 执行部署
    const deploySuccess = deployment.execute();
    
    if (deploySuccess) {
        console.log('\n--- 模拟部署出问题，需要回滚 ---');
        deployment.undo();
    }
}

// 运行示例
export function runMacroCommandExamples() {
    databaseTransactionExample();
    deploymentExample();
}

// 直接运行
if (typeof window === 'undefined') {
    runMacroCommandExamples();
}
