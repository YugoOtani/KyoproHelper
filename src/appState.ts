import * as vscode from 'vscode';
import * as fs from "fs";
import * as path from "path";

export class AppState {
    private static problems: Problem[] = [];

    static getCase(diff: string, id: number): TestCase | undefined {
        return this.problems.find(p => p.diff === diff)?.cases[id];
    }
    static getDiffList(): string[] {
        return this.problems.map(p => p.diff);
    }
    static getCaseList(diff: string): number[] {
        return this.problems.find(p => p.diff === diff)?.cases.map(c => c.id) ?? [];
    }
    static loadState(path: string) {
        this.problems = loadTestCases(path);
    }
}

class Problem {
    constructor(public diff: string, public cases: TestCase[]) {
    }
}
class TestCase {
    constructor(public id: number, public input: string, public output: string) { }
}


export function loadTestCases(filePath: string): Problem[] {
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
