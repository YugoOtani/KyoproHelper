import * as vscode from 'vscode';
import { activateRunTest } from './runTest';

export function activate(context: vscode.ExtensionContext) {
	activateRunTest(context);
}

export function deactivate() { }



