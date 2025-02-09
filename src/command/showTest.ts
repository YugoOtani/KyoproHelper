import { WebView } from "../webView";
import { TestCaseViewState } from "../media/render";
import * as vscode from "vscode";
import { commandId } from "./commandType";
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
export function showTestCaseHandler(
    diff: string,
    caseId: number,
    extensionUri: vscode.Uri) {
    const state = new TestCaseViewState(
        "beforeExec",
        diff,
        caseId,
        ""
    )
    WebView.createOrShow(renderWebView(state, extensionUri), extensionUri);

}


