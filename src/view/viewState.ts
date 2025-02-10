export type TestCaseViewKind = "beforeExec" | "beforeExecAll" | "success" | "fail" | "runAll";

export class TestCaseViewState {
    constructor(
        public kind: TestCaseViewKind,
        public isSuccess: { id: number, res: boolean }[],// only used for runAll
        public diff: string,
        public case_id: number,
        public actual_output: string,
    ) { }
}