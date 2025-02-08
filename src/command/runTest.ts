import * as child_process from "child_process";
import { WebView } from "../webView";
import { TestCaseViewHtml, TestCaseViewState } from "../ui";
import * as vscode from "vscode";
import { commandId } from "./commandType";
import { AppState } from "../appState";

const commandTitle = "Run Test";

// TestCaseを受け取って実行するコマンドを返す
// treeViewに渡すコールバックのようなもの
export function getRunTestCaseCommand(diff: string, caseId: number) {
    return {
        command: commandId("runTestCases"),
        title: commandTitle,
        arguments: [diff, caseId]
    };
}
// テストケースを実行するコマンドのハンドラを返す
export function getRunTestCommandHandler(workspaceRoot: string, extensionUri: vscode.Uri) {
    return (diff: string, caseId: number) => {
        runTest(diff, caseId, workspaceRoot, extensionUri);
    };
}

export function runTest(diff: string, caseId: number, workspaceRoot: string, extensionUri: vscode.Uri) {
    const testCase = AppState.getCase(diff, caseId);
    if (testCase === undefined) {
        vscode.window.showErrorMessage("Test case not found");
        return;
    }
    const process = child_process.spawnSync("cargo", ["run"], {
        cwd: workspaceRoot,
        input: testCase.input,
        encoding: "utf-8",
        shell: true
    });
    if (process.error) {
        vscode.window.showErrorMessage(`Execution failed: ${process.error.message}`);
        return;
    }
    const output = process.stdout.trim();
    const expected = testCase.output.trim();
    const state = new TestCaseViewState(
        (output === expected) ? "success" : "fail",
        diff,
        caseId,
        output
    )
    WebView.show(extensionUri, TestCaseViewHtml(state));
}

