export class Problem {
    readonly diff: string;
    readonly cases: { input: string, output: string }[];
    constructor(diff: string, cases: { input: string, output: string }[]) {
        this.diff = diff;
        this.cases = cases;
    }
}