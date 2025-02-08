import * as vscode from 'vscode';
import { getRunTestCaseCommand, getRunTestCommandHandler } from './command/runTest';
import { TestCasesProvider } from './testCasesProvider';
import { commandId } from './command/commandType';
import { getShowTestCaseCommand, getShowTestCaseHandler } from './command/showTest';
import { AppState } from './appState';
import * as path from 'path';

// defined in package.json
export const treeViewId = "testCasesView";

// input file
export const problemsPath = "contest.json";

// entry point
export function activate(context: vscode.ExtensionContext) {
	// ワークスペースのルートディレクトリを取得
	const workspaceRoot = getCurrentWorkspaceRoot();
	if (workspaceRoot === undefined) {
		return;
	}
	// 問題の読み込み
	AppState.loadState(path.join(workspaceRoot, problemsPath))

	// TreeView(サイドバーの部分)の登録
	const onTestCaseClicked = getShowTestCaseCommand
	const treeViewProvider = new TestCasesProvider(onTestCaseClicked)
	vscode.window.registerTreeDataProvider(treeViewId, treeViewProvider);

	// runTestコマンドの登録
	/*context.subscriptions.push(
		vscode.commands.registerCommand(
			commandId("runTestCases"),
			getRunTestCommandHandler(workspaceRoot, context.extensionUri)
		)
	);*/

	// showTestコマンドの登録

	context.subscriptions.push(
		vscode.commands.registerCommand(
			commandId("showTestCases"),
			getShowTestCaseHandler(workspaceRoot, context)
		)
	);
}

export function deactivate() { }

export function getCurrentWorkspaceRoot(): string | undefined {
	const folders = vscode.workspace.workspaceFolders;
	if (folders === undefined) {
		vscode.window.showErrorMessage("No workspace is opened.");
		return undefined;
	} else if (folders.length === 1) {
		return folders[0].uri.fsPath;
	} else {
		vscode.window.showErrorMessage("Multi-root workspace is not supported.");
		return undefined;
	}
}


