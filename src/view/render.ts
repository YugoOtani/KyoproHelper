import * as vscode from "vscode";
import * as ejs from "ejs";
import { AppState } from "../data/appState";
import { Logger } from "../debug/logger";
import * as fs from "fs";
import { TestCaseTitle } from "./ui";

export type TestCaseViewKind = "beforeExec" | "success" | "fail";

export class TestCaseViewState {
    constructor(
        public kind: TestCaseViewKind,
        public diff: string,
        public case_id: number,
        public actual_output: string,
    ) { }
}

export function renderWebView(state: TestCaseViewState, extensionUri: vscode.Uri): string {
    const templatePath = vscode.Uri.joinPath(extensionUri, 'src', 'ejs', 'index.html.ejs');
    const template = fs.readFileSync(templatePath.fsPath, "utf8");
    const case1 = AppState.getCase(state.diff, state.case_id);
    if (case1 === undefined) {
        return "Test case not found";
    }
    const data = {
        title: TestCaseTitle(state.case_id),
        diff: state.diff,
        case_id: state.case_id,
        input: case1.input,
        output: case1.output,
        actual_output: state.actual_output,
        viewKind: state.kind.toString(),
    }
    const html = ejs.render(template, { data });
    //Logger.longlog(html);
    return html;
}
