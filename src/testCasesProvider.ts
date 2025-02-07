import * as vscode from "vscode";
import { Problem, TestCase } from "./problem";
import { ProblemTitle, TestCaseTitle } from "./ui";

// サイドバーに表示する問題とテストケースの構造を定義
export class TestCasesProvider implements vscode.TreeDataProvider<TestCaseTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

    private problems: Problem[];
    private onTestCaseSelected: (t: TestCase) => vscode.Command;
    constructor(problems: Problem[], onTestCaseSelected: (t: TestCase) => vscode.Command) {
        this.onTestCaseSelected = onTestCaseSelected;
        this.problems = problems;
    }

    getTreeItem(element: TestCaseTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TestCaseTreeItem): Thenable<TestCaseTreeItem[]> {
        if (!element) {
            // ルート要素の場合 -> 問題一覧を表示
            const items = this.problems.map((p) => {
                const label = ProblemTitle(p);
                return new TestCaseTreeItem(label, p, vscode.TreeItemCollapsibleState.Collapsed);
            });
            items.sort((a, b) => a.problem.diff.localeCompare(b.problem.diff));
            return Promise.resolve(items);
        } else {
            // 問題の場合 -> テストケース一覧を表示
            const problem = element.problem;
            return Promise.resolve(problem.cases.map((tc) => new TestCaseTreeItem(
                TestCaseTitle(tc.id),
                problem,
                vscode.TreeItemCollapsibleState.None,
                // 選択時にコマンドが実行される
                this.onTestCaseSelected(tc),
            )));
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

}

class TestCaseTreeItem extends vscode.TreeItem {
    constructor(
        label: string,
        public readonly problem: Problem,
        collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }
}

