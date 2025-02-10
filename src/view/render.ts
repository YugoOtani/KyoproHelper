import * as vscode from "vscode";
import * as ejs from "ejs";
import { AppState } from "../data/appState";
import { Logger } from "../debug/logger";
import * as fs from "fs";
import { runAllTitle, testCaseTitle } from "./ui";
import { title } from "process";

export type TestCaseViewKind = "beforeExec" | "success" | "fail" | "runAll";

export class TestCaseViewState {
    constructor(
        public kind: TestCaseViewKind,
        public isSuccess: { id: number, res: boolean }[],// only used for runAll
        public diff: string,
        public case_id: number,
        public actual_output: string,
    ) { }
}
function renderTestCaseView(state: TestCaseViewState, extensionUri: vscode.Uri): string {
    const templatePath = vscode.Uri.joinPath(extensionUri, 'template', 'case1.html.ejs');
    const template = fs.readFileSync(templatePath.fsPath, "utf8");
    const case1 = AppState.getCase(state.diff, state.case_id);
    if (case1 === undefined) {
        return "Test case not found";
    }
    const data = {
        title: testCaseTitle(state.case_id),
        diff: state.diff,
        case_id: state.case_id,
        input: case1.input,
        output: case1.output,
        actual_output: state.actual_output,
        viewKind: state.kind.toString(),
    }
    const html = ejs.render(template, { data });
    return html;
}
function renderRunAllTestsView(state: TestCaseViewState, extensionUri: vscode.Uri): string {
    const templatePath = vscode.Uri.joinPath(extensionUri, 'template', 'all.html.ejs');
    const template = fs.readFileSync(templatePath.fsPath, "utf8");
    const res = state.isSuccess
    const data = {
        title: runAllTitle,
        results: res,
    }
    const html = ejs.render(template, { data });
    return html;
}

export function renderWebView(state: TestCaseViewState, extensionUri: vscode.Uri): string {
    if (state.kind === "runAll") {
        return renderRunAllTestsView(state, extensionUri);
    } else {
        return renderTestCaseView(state, extensionUri);
    }
}


