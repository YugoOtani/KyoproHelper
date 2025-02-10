export type Command =
    "showTestCases"
    | "runTestCase"
    | "runAllTestCases";

// package.jsonのcontributes.commandsのidと同じ
export function commandId(command: Command) {
    switch (command) {
        case "showTestCases": return "testCasesView.openTestCases";
        case "runTestCase": return "testCasesView.runTest";
        case "runAllTestCases": return "testCasesView.runAllTests";
    }
}
