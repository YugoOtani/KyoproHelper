import { WebView } from "../view/webView";
import { TestCaseViewState } from "../view/viewState";
import * as vscode from "vscode";
import { commandId } from "./commandType";
import { renderWebView } from "../view/render";

const commandTitle = "Show Test";

// TestCaseを受け取って表示するコマンドを返す
// treeViewに渡すコールバックのようなもの
export function getShowTestCaseCommand(diff: string, caseId: number) {
    return {
        command: commandId("showTestCase"),
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
        [],
        diff,
        caseId,
        ""
    )
    WebView.createOrShow(state, renderWebView(state, extensionUri), extensionUri);

}


