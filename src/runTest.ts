import * as child_process from "child_process";
import { WebView } from "./webView";
import { TestCaseViewFail, TestCaseViewHtml, TestCaseViewSuccess } from "./ui";
import * as vscode from "vscode";
import { TestCase } from "./problem";
import { runTestCommandId } from "./extension";

const commandTitle = "Run Test";

// TestCaseを受け取って実行するコマンドを返す
// treeViewに渡すコールバックのようなもの
export function getRunTestCommand(t: TestCase) {
    return {
        command: runTestCommandId,
        title: commandTitle,
        arguments: [t.id, t.input, t.output]
    };
}
// テストケースを実行するコマンドのハンドラを返す
export function getRunTestCommandHandler(workspaceRoot: string, extensionUri: vscode.Uri) {
    return (index: number, input: string, expected_output: string) => {
        runTest(index, input, expected_output, workspaceRoot, extensionUri);
    };
}

function runTest(index: number, input: string, expected_output: string, workspaceRoot: string, extensionUri: vscode.Uri) {
    const process = child_process.spawnSync("cargo", ["run"], {
        cwd: workspaceRoot,
        input: input,
        encoding: "utf-8",
        shell: true
    });
    if (process.error) {
        vscode.window.showErrorMessage(`Execution failed: ${process.error.message}`);
        return;
    }
    const output = process.stdout.trim();
    const expected = expected_output.trim();
    const content = (output === expected)
        ? TestCaseViewSuccess(index, input, output)
        : TestCaseViewFail(index, input, expected, output);

    WebView.show(extensionUri, TestCaseViewHtml(content));
}

