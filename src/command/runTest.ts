import * as child_process from "child_process";
import { testResultProvider } from "../view/testResultProvider";
import { TestCaseViewState } from "../ejs/render";
import * as vscode from "vscode";
import { AppState } from "../data/appState";
import { Logger } from "../debug/logger";
import { renderWebView } from "../ejs/render";

export function messageHandlerForRunTest(
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
}

function runTest(diff: string, caseId: number, workspaceRoot: string, extensionUri: vscode.Uri) {
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
    const html = renderWebView(state, extensionUri)
    testResultProvider.createOrShow(html, extensionUri);
}

