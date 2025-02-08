import { WebView } from "../webView";
import { TestCaseViewHtml, TestCaseViewState } from "../ui";
import * as vscode from "vscode";
import { commandId } from "./commandType";
import { runTest } from "./runTest";

const commandTitle = "Run Test";

// TestCaseを受け取って表示するコマンドを返す
// treeViewに渡すコールバックのようなもの
export function getShowTestCaseCommand(diff: string, caseId: number) {
    return {
        command: commandId("showTestCases"),
        title: commandTitle,
        arguments: [diff, caseId]
    };
}
// テストケースを表示するコマンドのハンドラを返す
export function getShowTestCaseHandler(
    workspaceRoot: string,
    extensionUri: vscode.Uri) {
    return (diff: string, caseId: number) => {
        const state = new TestCaseViewState(
            "beforeExec",
            diff,
            caseId,
            ""
        )
        WebView.setMessageHandler((message) => {
            if (message.command === "runTest") {
                const diff = message.diff;
                const caseId = message.case_id;
                runTest(diff, caseId, workspaceRoot, extensionUri);
            }
        }, extensionUri)
        const html = TestCaseViewHtml(state);
        WebView.show(extensionUri, html);
    };
}


