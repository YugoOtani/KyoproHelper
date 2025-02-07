import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";
import { TestCasesPanel } from "./testResultPanel";

class TestCasesProvider implements vscode.TreeDataProvider<TestCaseItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

    private selectedProblem: string = "A";
    private testCases: { [key: string]: { input: string; output: string }[] } = {};
    constructor(private workspaceRoot: string) {
        this.loadTestCases();
    }

    private loadTestCases(): void {
        const filePath = path.join(this.workspaceRoot, "contest.json");
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, "utf-8");
            const json = JSON.parse(data);
            for (const problem of json.problem) {
                const key = problem.diff
                const in_out = problem.expected_in_out.map((x: string[]) => {
                    return { input: x[0], output: x[1] }
                })
                this.testCases[key] = in_out
            }
        } else {
            vscode.window.showErrorMessage("contest.json not found.");
        }
    }

    getTreeItem(element: TestCaseItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TestCaseItem): Thenable<TestCaseItem[]> {
        if (!element) {
            return Promise.resolve([
                new TestCaseItem("Problem A", "a", vscode.TreeItemCollapsibleState.Collapsed),
                new TestCaseItem("Problem B", "b", vscode.TreeItemCollapsibleState.Collapsed),
                new TestCaseItem("Problem C", "c", vscode.TreeItemCollapsibleState.Collapsed),
                new TestCaseItem("Problem D", "d", vscode.TreeItemCollapsibleState.Collapsed),
                new TestCaseItem("Problem E", "e", vscode.TreeItemCollapsibleState.Collapsed),
            ]);
        } else {
            const cases = this.testCases[element.problemId.toLowerCase()] || [];
            return Promise.resolve(cases.map((tc, index) => new TestCaseItem(
                `Test ${index + 1}: ${tc.input.trim()} → ${tc.output.trim()}`,
                element.problemId,
                vscode.TreeItemCollapsibleState.None,
                {
                    command: "testCasesView.runTest",
                    title: "Run Test",
                    arguments: [tc.input, tc.output]
                }
            )));
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    setSelectedProblem(problemId: string): void {
        this.selectedProblem = problemId;
        this.refresh();
    }
}

class TestCaseItem extends vscode.TreeItem {
    constructor(
        label: string,
        public readonly problemId: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
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

export function activateTreeView(context: vscode.ExtensionContext) {
    const workspaceRoot = getCurrentWorkspaceRoot();
    if (workspaceRoot === undefined) {
        return;
    }
    const provider = new TestCasesProvider(workspaceRoot || "");

    vscode.window.registerTreeDataProvider("testCasesView", provider);

    context.subscriptions.push(
        vscode.commands.registerCommand("testCasesView.selectProblem", (problemId: string) => {
            provider.setSelectedProblem(problemId);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("testCasesView.runTest", (input: string, output: string) => {
            runTest(input, output, workspaceRoot || "", context.extensionUri);
        })
    );
}
export function runAllTests() {
    vscode.window.showInformationMessage("Run All Tests");
}

export function runTest(input: string, expected_output: string, workspaceRoot: string, extensionUri: vscode.Uri) {

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
    let content = `<p><strong> Test </strong></p>`;
    content += `<p>Input: <code>${input}</code></p>`;
    if (output === expected) {
        content += `<p class="success">✅ Passed</p>`;
    } else {
        content += `<p class="fail">❌ Failed</p>`;
        content += `<p>Expected: <code>${expected}</code></p>`;
        content += `<p>Got: <code>${output}</code></p>`;
    }

    TestCasesPanel.show(extensionUri, content);
}
