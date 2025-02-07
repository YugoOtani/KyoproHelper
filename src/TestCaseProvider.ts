import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";
import { TestCasesPanel } from "./testResultPanel";
import { Problem } from "./data/problem";
import { ProblemTitle, TestCaseTitle, TestCaseViewSuccess, TestCaseViewFail } from "./view/testCaseView";

class TestCasesProvider implements vscode.TreeDataProvider<TestCaseItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

    private problems: Problem[] = [];
    constructor(private workspaceRoot: string) {
        this.loadTestCases();
    }

    private loadTestCases(): void {
        const filePath = path.join(this.workspaceRoot, "contest.json");
        if (fs.existsSync(filePath)) {
            const s = fs.readFileSync(filePath, "utf-8");
            const json = JSON.parse(s);
            for (const problem of json.problem) {
                const diff = problem.diff

                const cases = problem.expected_in_out.map((x: string[]) => ({ input: x[0], output: x[1] }));
                this.problems.push(new Problem(diff, cases))
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
            // ルート要素の場合 -> 問題一覧を表示
            const items = this.problems.map((p) => {
                const label = ProblemTitle(p);
                return new TestCaseItem(label, p, vscode.TreeItemCollapsibleState.Collapsed);
            });
            items.sort((a, b) => a.problem.diff.localeCompare(b.problem.diff));
            return Promise.resolve(items);
        } else {
            // 問題の場合 -> テストケース一覧を表示
            const problem = element.problem;
            return Promise.resolve(problem.cases.map((tc, index) => new TestCaseItem(
                TestCaseTitle(index),
                problem,
                vscode.TreeItemCollapsibleState.None,
                {
                    command: "testCasesView.runTest",
                    title: "Run Test", // TODO
                    arguments: [index, tc.input, tc.output]
                }
            )));
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

}

class TestCaseItem extends vscode.TreeItem {
    constructor(
        label: string,
        public readonly problem: Problem,
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
        vscode.commands.registerCommand("testCasesView.runTest", (index: number, input: string, output: string) => {
            runTest(index, input, output, workspaceRoot || "", context.extensionUri);
        })
    );
}
export function runAllTests() {
    vscode.window.showInformationMessage("Run All Tests");
}

export function runTest(index: number, input: string, expected_output: string, workspaceRoot: string, extensionUri: vscode.Uri) {

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

    TestCasesPanel.show(extensionUri, content);
}
