export class Problem {
    readonly diff: string;
    readonly cases: TestCase[];
    constructor(diff: string, cases: TestCase[]) {
        this.diff = diff;
        this.cases = cases;
    }
}
export class TestCase {
    readonly id: number;
    readonly input: string;
    readonly output: string;
    constructor(id: number, input: string, output: string) {
        this.id = id;
        this.input = input;
        this.output = output;
    }
}