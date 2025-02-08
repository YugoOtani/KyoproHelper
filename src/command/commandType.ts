export type Command = "showTestCases" | "runTestCases";

// package.jsonのcontributes.commandsのidと同じ
export function commandId(command: Command) {
    switch (command) {
        case "showTestCases": return "testCasesView.openTestCases";
        case "runTestCases": return "testCasesView.runTest";
    }
}
