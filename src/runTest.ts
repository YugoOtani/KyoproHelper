import * as child_process from "child_process";
import { WebView } from "./webView";
import { TestCaseViewFail, TestCaseViewSuccess } from "./ui";
import { TestCasesProvider } from "./testCasesProvider";
import * as vscode from "vscode";
import { Problem } from "./problem";
import * as fs from "fs";
import * as path from "path";
const sampleInputFilePath = "contest.json";

const commandId = "testCasesView.runTest";
const treeViewId = "testCasesView";

export function activateRunTest(context: vscode.ExtensionContext) {
    const workspaceRoot = getCurrentWorkspaceRoot();
    if (workspaceRoot === undefined) {
        return;
    }
    const provider = new TestCasesProvider(loadTestCases());

    vscode.window.registerTreeDataProvider(treeViewId, provider);

    context.subscriptions.push(
        vscode.commands.registerCommand(commandId, (index: number, input: string, output: string) => {
            runTest(index, input, output, workspaceRoot || "", context.extensionUri);
        })
    );
}

function runTest(index: number, input: string, expected_output: string, workspaceRoot: string, extensionUri: vscode.Uri) {
    const process = child_process.spawnSync("cargo", ["run"], {
        cwd: workspaceRoot,
        input: input,
        encoding: "utf-8",
        shell: true
    });
    if (process.error) {
        vscode.window.showErrorMessage(`Execution failed: ${process.error.message}`);
        return;
    }
    const output = process.stdout.trim();
    const expected = expected_output.trim();
    const content = (output === expected)
        ? TestCaseViewSuccess(index, input, output)
        : TestCaseViewFail(index, input, expected, output);

    WebView.show(extensionUri, content);
}
function loadTestCases(): Problem[] {
    const workspaceRoot = getCurrentWorkspaceRoot();
    if (workspaceRoot === undefined) {
        return [];
    }
    const filePath = path.join(workspaceRoot, sampleInputFilePath);
    if (fs.existsSync(filePath)) {
        const s = fs.readFileSync(filePath, "utf-8");
        const json = JSON.parse(s);
        let problems = [];
        for (const problem of json.problem) {
            const diff = problem.diff
            const cases = problem.expected_in_out.map((x: string[]) => ({ input: x[0], output: x[1] }));
            problems.push(new Problem(diff, cases))
        }
        return problems;
    } else {
        vscode.window.showErrorMessage(`File not found: ${filePath}`);
        return [];
    }
}
function getCurrentWorkspaceRoot(): string | undefined {
    const folders = vscode.workspace.workspaceFolders;
    if (folders === undefined) {
        vscode.window.showErrorMessage("No workspace is opened.");
        return undefined;
    } else if (folders.length === 1) {
        return folders[0].uri.fsPath;
    } else {
        vscode.window.showErrorMessage("Multi-root workspace is not supported.");
        return undefined;
    }
}