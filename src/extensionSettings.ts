import * as vscode from 'vscode';
export class ExtensionSettings {
    static getCommand(): string | undefined {
        return vscode.workspace
            .getConfiguration()
            .get(`kyopro.command`);
    }
    static getArgs(): string[] | undefined {
        return vscode.workspace
            .getConfiguration()
            .get(`kyopro.args`);
    }
}