import * as vscode from "vscode";
import { commandId } from "./commandType";
import { AppState } from "../data/appState";
import { ExtensionSettings } from "../extensionSettings";
import * as child_process from "child_process";
import { renderWebView, TestCaseViewState } from "../view/render";
import { WebView } from "../view/webView";

export function getRunAllTestsCommand(diff: string): vscode.Command {
    return {
        command: commandId("runAllTestCases"),
        title: "Run All Tests",
        arguments: [diff]
    };
}

export function runAllTests(
    diff: string,
    workspaceRoot: string,
    extensionUri: vscode.Uri) {
    const command: string | undefined = ExtensionSettings.getCommand();
    const args: string[] | undefined = ExtensionSettings.getArgs();
    if (command === undefined || args === undefined) {
        vscode.window.showErrorMessage(`command: ${command}, args: ${args}`);
        vscode.window.showErrorMessage("Set the command and args in the extension configuration");
        return;
    }

    const testCase = AppState.getCaseList(diff);
    let mp = [];
    for (const c of testCase) {
        const case1 = AppState.getCase(diff, c)!;
        const id = case1.id;
        const input = case1.input;
        const expected_output = case1.output;
        const process = child_process.spawnSync(command, args, {
            cwd: workspaceRoot,
            input: input,
            encoding: "utf-8",
            shell: true
        });
        if (process.error) {
            vscode.window.showErrorMessage(`Execution failed: ${process.error.message}`);
            continue;
        }
        mp.push({ id: id, res: process.stdout.trim() == expected_output.trim() });
    }
    const state = new TestCaseViewState(
        "runAll",
        mp,
        diff,
        0,
        "");
    const html = renderWebView(state, extensionUri)
    WebView.createOrShow(state, html, extensionUri);
}