import { WebView } from "../webView";
import { TestCaseViewState } from "../ui";
import * as vscode from "vscode";
import { commandId } from "./commandType";
import { runTest } from "./runTest";
import { renderWebView } from "../media/render";

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
    context: vscode.ExtensionContext) {
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
                runTest(diff, caseId, workspaceRoot, context.extensionUri);
            }
        }, context.extensionUri)
        WebView.show(context.extensionUri, renderWebView(state, context));
    };
}


