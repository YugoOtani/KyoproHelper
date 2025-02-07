import * as vscode from 'vscode';
import { Problem, TestCase } from "./problem";
import * as fs from "fs";
import * as path from "path";

export function loadTestCases(problemsPath: string): Problem[] {
    const workspaceRoot = getCurrentWorkspaceRoot();
    if (workspaceRoot === undefined) {
        return [];
    }
    const filePath = path.join(workspaceRoot, problemsPath);
    if (fs.existsSync(filePath)) {
        const s = fs.readFileSync(filePath, "utf-8");
        const json = JSON.parse(s);
        let problems = [];
        for (const problem of json.problem) {
            const diff = problem.diff
            const cases: TestCase[] = problem.expected_in_out.map((x: string[], index: number) => {
                return new TestCase(index + 1, x[0], x[1])
            });
            problems.push(new Problem(diff, cases))
        }
        return problems;
    } else {
        vscode.window.showErrorMessage(`File not found: ${filePath}`);
        return [];
    }
}

export function getCurrentWorkspaceRoot(): string | undefined {
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