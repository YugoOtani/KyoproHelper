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
    const case1 = AppState.getCase(state.diff, state.case_id);
    if (case1 === undefined) {
        return "Test case not found";
    }
    const input = case1.input;
    const output = case1.output;
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
                <h2>${TestCaseTitle(state.case_id)}</h2>
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
                
                <h2>Input</h2>
                    <pre>${input}</pre>
                <h2>Output</h2>
                    <pre>${output}</pre>
                <h2>Your Output</h2>
                    ${result}
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
