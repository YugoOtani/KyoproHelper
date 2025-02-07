import * as vscode from "vscode";
import { Problem } from "./problem";
import { ProblemTitle, TestCaseTitle } from "./ui";

const commandId = "testCasesView.runTest";
const treeViewTitle = "Test Cases";


export class TestCasesProvider implements vscode.TreeDataProvider<TestCaseItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

    private problems: Problem[];
    constructor(problems: Problem[]) {
        this.problems = problems;
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
                    command: commandId,
                    title: treeViewTitle, // TODO
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

