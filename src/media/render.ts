import * as vscode from "vscode";
import * as ejs from "ejs";
import { AppState } from "../appState";
import { Logger } from "../debug/logger";
import * as fs from "fs";

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
    const templatePath = vscode.Uri.joinPath(extensionUri, 'src', 'media', 'index.html.ejs');
    const template = fs.readFileSync(templatePath.fsPath, "utf8");
    const case1 = AppState.getCase(state.diff, state.case_id);
    if (case1 === undefined) {
        return "Test case not found";
    }
    const data = {
        title: `Test Results ${state.case_id}`,
        diff: state.diff,
        case_id: state.case_id,
        input: case1.input,
        output: case1.output,
        show_res: true
    }
    const html = ejs.render(template, { data });
    //Logger.log(html);
    return html;
}
function f(state: TestCaseViewState) {
    let result = "";
    switch (state.kind) {
        case "beforeExec":
            result = "Not yet executed";
            break;
        case "success":
            result =
                `<div>
                    <pre>${state.actual_output}</pre> 
                    -> <span class="success">✅ Passed </span>
                </div>`;
            break;
        case "fail":
            result =
                `<div>
                    <pre>${state.actual_output}</pre> 
                    -> <span class="fail">❌ Failed </span>
                </div>`;
            break;
    }
}
