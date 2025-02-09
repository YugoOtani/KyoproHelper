import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class Logger {
    private static logPath: string | undefined = undefined;

    static activate(context: vscode.ExtensionContext) {
        this.logPath = path.join(context.globalStorageUri.fsPath, "debug.log");
        fs.mkdirSync(path.dirname(this.logPath), { recursive: true });
        fs.writeFileSync(this.logPath, "", { flag: "w" }); // clear
    }
    static log(...messageList: any[]) {
        const message = messageList.map(m => JSON.stringify(m)).join(" ");
        if (message.length < 100) {
            this.shortLog(message);
        } else {
            this.shortLog(message.slice(0, 100) + "...");
            this.longlog(message);
        }
    }

    static shortLog(message: string) {
        vscode.window.showInformationMessage(message);
    }
    static longlog(message: string) {
        if (this.logPath === undefined) {
            vscode.window.showErrorMessage("Full log is not activated");
            return;
        } else {
            vscode.window.showInformationMessage("Full log is written to " + this.logPath);
        }
        fs.writeFileSync(this.logPath, message + "\n", { flag: "a" });// append
    }
}
