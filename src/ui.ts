import { Problem } from "./problem";

export function TestCaseViewHtml(content: string): string {
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
            </body>
            </html>
        `;
}

export function ProblemTitle(problem: Problem): string {
    return `Problem ${problem.diff.toUpperCase()}`;
}
export function TestCaseTitle(index: number): string {
    return `Test Case ${index}`;
}
export function TestCaseViewBeforeExec(input: string, expected_output: string): string {
    return `
        <h2>Input</h2>
        <pre>${input}</pre>
        <h2>Output</h2>
        <pre>${expected_output}</pre>
    `;
}
export function TestCaseViewSuccess(index: number, input: string, output: string): string {
    return `
        <h2>${TestCaseTitle(index)}</h2>
        <h2>Input</h2>
        <pre>${input}</pre>
        <h2>Output</h2>
        <pre class="success">${output}</pre>
        <p class="success">✅ Passed</p>
    `;
}
export function TestCaseViewFail(index: number, input: string, expected: string, actual: string): string {
    return `
        <h2>${TestCaseTitle(index)}</h2>
        <h2>Input</h2>
        <pre>${input}</pre>
        <h2>Expected Output</h2>
        <pre>${expected}</pre>
        <h2>Actual Output</h2>
        <pre class="fail">${actual}</pre>
        <p class="fail">❌ Failed</p>
    `;
}
