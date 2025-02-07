import * as vscode from "vscode";
const panelTitle = "Test Results";
const panelId = "testResults";

export class WebView {
    public static currentPanel: WebView | undefined;
    private readonly panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];

    private constructor(extensionUri: vscode.Uri) {
        this.panel = vscode.window.createWebviewPanel(
            panelId,
            panelTitle,
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }

    public static show(extensionUri: vscode.Uri, content: string) {
        if (WebView.currentPanel) {
            WebView.currentPanel.update(content);
            WebView.currentPanel.panel.reveal();
        } else {
            WebView.currentPanel = new WebView(extensionUri);
            WebView.currentPanel.update(content);
        }
    }

    public update(content: string) {
        this.panel.webview.html = content;
    }

    public dispose() {
        WebView.currentPanel = undefined;
        this.panel.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}
