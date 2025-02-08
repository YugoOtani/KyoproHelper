import { AppState } from "./appState";

export type TestCaseViewKind = "beforeExec" | "success" | "fail";

export class TestCaseViewState {
    constructor(
        public kind: TestCaseViewKind,
        public diff: string,
        public case_id: number,
        public actual_output: string,
    ) { }
}

export function TestCaseViewHtml(state: TestCaseViewState): string {
    let content: string;

    switch (state.kind) {
        case "beforeExec":
            content = TestCaseViewBeforeExec(state);
            break;
        case "success":
            content = TestCaseViewSuccess(state);
            break;
        case "fail":
            content = TestCaseViewFail(state);
            break;
    }

    return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Test Results</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    .success { color: green; }
                    .fail { color: red; }
                </style>
            </head>
            <body>
                ${content}
                <button onclick="runTest('${state.diff}', ${state.case_id})">Run Test</button>
                <div id="result"></div>
                <script>
                    const vscode = acquireVsCodeApi();
                    function runTest(diff, case_id) {
                        vscode.postMessage({ command: "runTest", diff, case_id });
                    }
                    window.addEventListener("message", event => {
                        document.getElementById("result").innerHTML = event.data.result;
                    })
                </script>
            </body>

            </html>
        `;
}

export function ProblemTitle(diff: string): string {
    return `Problem ${diff.toUpperCase()}`;
}
export function TestCaseTitle(index: number): string {
    return `Test Case ${index}`;
}
function TestCaseViewBeforeExec(state: TestCaseViewState): string {
    const case1 = AppState.getCase(state.diff, state.case_id);
    if (case1 === undefined) {
        return "Test case not found";
    }
    return `
        <h2>${TestCaseTitle(state.case_id)}</h2>
        <h2>Input</h2>
        <pre>${case1.input}</pre>
        <h2>Output</h2>
        <pre>${case1.output}</pre>
    `;
}
function TestCaseViewSuccess(state: TestCaseViewState): string {
    const case1 = AppState.getCase(state.diff, state.case_id);
    if (case1 === undefined) {
        return "Test case not found";
    }
    return `
        <h2>${TestCaseTitle(state.case_id)}</h2>
        <h2>Input</h2>
        <pre>${case1.input}</pre>
        <h2>Output</h2>
        <pre class="success">${case1.output}</pre>
        <p class="success">✅ Passed</p>
    `;
}
function TestCaseViewFail(state: TestCaseViewState): string {
    const case1 = AppState.getCase(state.diff, state.case_id);
    if (case1 === undefined) {
        return "Test case not found";
    }
    return `
        <h2>${TestCaseTitle(state.case_id)}</h2>
        <h2>Input</h2>
        <pre>${case1.input}</pre>
        <h2>Expected Output</h2>
        <pre>${case1.output}</pre>
        <h2>Actual Output</h2>
        <pre class="fail">${state.actual_output}</pre>
        <p class="fail">❌ Failed</p>
    `;
}
function getNonce() {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}