import * as vscode from "vscode";
import * as fs from "fs";
import * as ejs from "ejs";
import * as path from "path";

export type TestCaseViewKind = "beforeExec" | "success" | "fail";

export class TestCaseViewState {
    constructor(
        public kind: TestCaseViewKind,
        public diff: string,
        public case_id: number,
        public actual_output: string,
    ) { }
}

export function renderWebView(state: TestCaseViewState, context: vscode.ExtensionContext): string {
    const templatePath = path.join(context.extensionPath, "src/media/index.html.ejs");
    const cssPath = vscode.Uri.file(
        path.join(context.extensionPath, "src/media/style.css")
    ).with({ scheme: "vscode-resource" }); const template = fs.readFileSync(templatePath, "utf8");
    const viewState = {
        title: "Test Results"
    }

    return ejs.render(template, { viewState, cssUri: cssPath.toString() });
}

