import * as vscode from "vscode";
import { problemTitle, runAllTestsLabel, testCaseTitle } from "./ui";
import { AppState } from "../data/appState";

// サイドバーに表示する問題とテストケースの構造を定義
export class TestCasesProvider implements vscode.TreeDataProvider<TestCaseTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;
    private onAllTestsSelected: (diff: string) => vscode.Command;
    private onTestCaseSelected: (diff: string, caseId: number) => vscode.Command;
    constructor(
        onAllTestsSelected: (diff: string) => vscode.Command,
        onTestCaseSelected: (diff: string, caseId: number) => vscode.Command) {
        this.onAllTestsSelected = onAllTestsSelected;
        this.onTestCaseSelected = onTestCaseSelected;
    }

    getTreeItem(element: TestCaseTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TestCaseTreeItem): Thenable<TestCaseTreeItem[]> {
        if (!element) {
            // ルート要素の場合 -> 問題一覧を表示
            const diffs = AppState.getDiffList();
            diffs.sort();
            const items = diffs.map((diff) => {
                const problem = AppState.getCaseList(diff);
                return new TestCaseTreeItem(diff, problemTitle(diff), problem, vscode.TreeItemCollapsibleState.Collapsed);
            });
            return Promise.resolve(items);
        } else {
            // 問題の場合 -> テストケース一覧を表示
            const runAllTestsItem = new TestCaseTreeItem(
                element.diff,
                runAllTestsLabel,
                element.cases,
                vscode.TreeItemCollapsibleState.None,
                this.onAllTestsSelected(element.diff),
            )
            let items = [runAllTestsItem];
            for (const caseId of element.cases) {
                const item = new TestCaseTreeItem(
                    element.diff,
                    testCaseTitle(caseId),
                    element.cases,
                    vscode.TreeItemCollapsibleState.None,
                    // 選択時にコマンドが実行される
                    this.onTestCaseSelected(element.diff, caseId),
                )
                items.push(item);
            }
            return Promise.resolve(items);
        }
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

}

class TestCaseTreeItem extends vscode.TreeItem {
    constructor(
        public diff: string,
        label: string,
        public readonly cases: number[],
        collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }
}

