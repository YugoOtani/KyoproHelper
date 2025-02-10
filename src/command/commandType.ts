export type Command =
    "showTestCase"
    | "runTestCase"
    | "showAllTestCases"
    | "runAllTestCases";

// package.jsonのcontributes.commandsのidと同じ
export function commandId(command: Command) {
    switch (command) {
        case "showTestCase": return "testCasesView.openTestCases";
        case "runTestCase": return "testCasesView.runTest";
        case "runAllTestCases": return "testCasesView.runAllTests";
        case "showAllTestCases": return "testCasesView.openAllTestCases";
    }
}
