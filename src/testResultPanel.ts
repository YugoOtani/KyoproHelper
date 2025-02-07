import * as vscode from "vscode";

export class TestCasesPanel {
    public static currentPanel: TestCasesPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];

    private constructor(extensionUri: vscode.Uri) {
        this.panel = vscode.window.createWebviewPanel(
            "testResults",
            "Test Results",
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }

    public static show(extensionUri: vscode.Uri, content: string) {
        if (TestCasesPanel.currentPanel) {
            TestCasesPanel.currentPanel.update(content);
            TestCasesPanel.currentPanel.panel.reveal();
        } else {
            TestCasesPanel.currentPanel = new TestCasesPanel(extensionUri);
            TestCasesPanel.currentPanel.update(content);
        }
    }

    public update(content: string) {
        this.panel.webview.html = this.getHtml(content);
    }

    private getHtml(content: string): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Test Results</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    .success { color: green; }
                    .fail { color: red; }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;
    }

    public dispose() {
        TestCasesPanel.currentPanel = undefined;
        this.panel.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}
