import * as child_process from "child_process";
import { WebView } from "../view/webView";
import { TestCaseViewState } from "../view/viewState";
import * as vscode from "vscode";
import { AppState } from "../data/appState";
import { Logger } from "../debug/logger";
import { renderWebView } from "../view/render";
import { commandId } from "./commandType";
import { ExtensionSettings } from "../extensionSettings";


/*export function messageHandlerForRunTest(
    message: any,
    uri: vscode.Uri) {
    if (message.command === "runTest") {
        const diff = message.diff;
        const caseId = message.case_id;
        const workspaceRoot = AppState.workSpaceRoot;
        if (workspaceRoot === undefined) {
            return;
        }
        runTest(diff, caseId, workspaceRoot, uri);
    }
}*/

// run test case and show result
export function runTest(
    diff: string,
    caseId: number,
    workspaceRoot: string,
    extensionUri: vscode.Uri) {
    const testCase = AppState.getCase(diff, caseId);
    if (testCase === undefined) {
        vscode.window.showErrorMessage("Test case not found");
        return;
    }
    const command: string | undefined = ExtensionSettings.getCommand();
    const args: string[] | undefined = ExtensionSettings.getArgs();
    if (command === undefined || args === undefined) {
        vscode.window.showErrorMessage(`command: ${command}, args: ${args}`);
        vscode.window.showErrorMessage("Set the command and args in the extension configuration");
        return;
    }
    const process = child_process.spawnSync(command, args, {
        cwd: workspaceRoot,
        input: testCase.input,
        encoding: "utf-8",
        shell: true
    });
    if (process.error) {
        vscode.window.showErrorMessage(`Execution failed: ${process.error.message}`);
        return;
    }
    let output = process.stdout.trim();
    if (output === "") {
        output = process.stderr.trim();
    }
    const expected = testCase.output.trim();
    const state = new TestCaseViewState(
        (output === expected) ? "success" : "fail",
        [],
        diff,
        caseId,
        output
    )
    const html = renderWebView(state, extensionUri)
    WebView.createOrShow(state, html, extensionUri);
}

