import * as vscode from 'vscode';
import * as fs from 'fs';
import { Logger } from './debug/logger';
import { TestCasesProvider } from './view/treeView';
import { commandId } from './command/commandType';
import { getShowTestCaseCommand, showTestCaseHandler } from './command/showTest';
import { AppState } from './data/appState';
import * as path from 'path';
import { WebView } from './view/webView';
import assert from 'assert';
import { runTest } from './command/runTest';
import { getRunAllTestsCommand, runAllTests } from './command/runAllTests';
import { getShowAllTestsCommand, showAllTestsHandler } from './command/showAllTests';

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
	const problemsDirPath = path.join(workspaceRoot, problemsPath)
	if (!fs.existsSync(problemsDirPath)) {
		vscode.window.showErrorMessage("No contest.json found in the workspace root");
		return;
	}
	// Loggerの有効化
	Logger.activate(context);

	// 問題の読み込み
	AppState.loadState(problemsDirPath)

	// TreeView(サイドバーの部分)の登録
	const onAllTestsClicked = getShowAllTestsCommand
	const onTestCaseClicked = getShowTestCaseCommand
	const treeViewProvider = new TestCasesProvider(onAllTestsClicked, onTestCaseClicked)
	vscode.window.registerTreeDataProvider(treeViewId, treeViewProvider);

	// WebViewの作成
	// runTestコマンドの登録
	// -> 開いているWebViewに応じて異なるコマンドを実行
	context.subscriptions.push(
		vscode.commands.registerCommand(
			commandId("runTestCase"),
			() => {
				// テストケースのWebViewが開かれているか確認
				const state = WebView.currentPanel?.viewState();
				if (state === undefined) {
					vscode.window.showErrorMessage("Open test case view first");
					return;
				}
				switch (state.kind) {
					case "beforeExec":
					case "fail":
					case "success":
						runTest(state.diff, state.case_id, workspaceRoot, context.extensionUri);
						break;
					case "beforeExecAll":
					case "runAll":
						runAllTests(state.diff, workspaceRoot, context.extensionUri);
						break;
					default:
						assert.fail("Invalid state");

				}

			}
		)
	);
	// showTestコマンドの登録
	context.subscriptions.push(
		vscode.commands.registerCommand(
			commandId("showTestCase"),
			(diff, id) => showTestCaseHandler(diff, id, context.extensionUri)
		)
	);
	// stateus barにもrunボタンを登録
	/*const runButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	runButton.text = "$(play) Run";
	runButton.command = "extension.runAllTests";
	//runButton.hide();
	runButton.show();
	
	context.subscriptions.push(runButton);*/
	// runAllTestsコマンドの登録
	context.subscriptions.push(
		vscode.commands.registerCommand(
			commandId("showAllTestCases"),
			(diff) => {
				showAllTestsHandler(diff, workspaceRoot, context.extensionUri);
			}
		)
	);
}

export function deactivate() { }

