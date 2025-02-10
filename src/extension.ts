import * as vscode from 'vscode';
import { Logger } from './debug/logger';
import { TestCasesProvider } from './view/testCasesProvider';
import { commandId } from './command/commandType';
import { getShowTestCaseCommand, showTestCaseHandler } from './command/showTest';
import { AppState } from './data/appState';
import * as path from 'path';
import { testResultProvider } from './view/testResultProvider';
import assert from 'assert';
import { messageHandlerForRunTest } from './command/runTest';

// defined in package.json
export const treeViewId = "testCasesView";

// input file
export const problemsPath = "contest.json";

// entry point
export function activate(context: vscode.ExtensionContext) {
	// ワークスペースのルートディレクトリを取得
	const workspaceRoot = AppState.workSpaceRoot;
	if (workspaceRoot === undefined) {
		return;
	}
	// Loggerの有効化
	Logger.activate(context);

	// 問題の読み込み
	AppState.loadState(path.join(workspaceRoot, problemsPath))

	// TreeView(サイドバーの部分)の登録
	const onTestCaseClicked = getShowTestCaseCommand
	const treeViewProvider = new TestCasesProvider(onTestCaseClicked)
	vscode.window.registerTreeDataProvider(treeViewId, treeViewProvider);

	// WebViewの作成
	// runTestコマンドの登録
	testResultProvider.setMessageHandler((message) => {
		messageHandlerForRunTest(message, context.extensionUri);
	});
	// showTestコマンドの登録
	context.subscriptions.push(
		vscode.commands.registerCommand(
			commandId("showTestCases"),
			(diff, id) => showTestCaseHandler(diff, id, context.extensionUri)
		)
	);
	const runButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	runButton.text = "$(play) Run";
	runButton.command = "extension.runAllTests";
	//runButton.hide();
	runButton.show();

	context.subscriptions.push(runButton);
}

export function deactivate() { }

