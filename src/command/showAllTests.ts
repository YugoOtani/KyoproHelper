import { WebView } from "../view/webView";
import { TestCaseViewState } from "../view/viewState";
import * as vscode from "vscode";
import { commandId } from "./commandType";
import { renderWebView } from "../view/render";
import { AppState } from "../data/appState";

const commandTitle = "Show Test";

export function getShowAllTestsCommand(diff: string) {
    return {
        command: commandId("showAllTestCases"),
        title: commandTitle,
        arguments: [diff]
    };
}
export function showAllTestsHandler(
    diff: string,
    workspaceRoot: string,
    extensionUri: vscode.Uri) {
    const cases = AppState.getCaseList(diff).map((c) => { return { id: c, res: false } })

    const state = new TestCaseViewState(
        "beforeExecAll",
        cases,
        diff,
        0,
        ""
    )
    WebView.createOrShow(state, renderWebView(state, extensionUri), extensionUri);

}


