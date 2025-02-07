import * as vscode from 'vscode';
import { getCurrentWorkspaceRoot, loadTestCases } from './common';
import { getRunTestCommand, getRunTestCommandHandler } from './runTest';
import { TestCasesProvider } from './testCasesProvider';

// defined in package.json
export const openTestCasesCommandId = "testCasesView.openTestCases";
export const runTestCommandId = "testCasesView.runTest";
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
	const problems = loadTestCases(problemsPath);

	// TreeView(サイドバーの部分)の登録
	const onTestCaseClicked = getRunTestCommand
	vscode.window.registerTreeDataProvider(
		treeViewId,
		new TestCasesProvider(problems, onTestCaseClicked));

	// runTestコマンドの登録
	context.subscriptions.push(
		vscode.commands.registerCommand(
			runTestCommandId,
			getRunTestCommandHandler(workspaceRoot, context.extensionUri)
		)
	);
}

export function deactivate() { }




