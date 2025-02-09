import * as vscode from "vscode";
import { panelTitle } from "./ui";

const panelId = "testResults";

export class testResultProvider {
    static currentPanel: testResultProvider | undefined;
    static messageHandler: (message: any) => void;
    static readonly viewType = panelId;
    private readonly panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];

    static createOrShow(
        content: string,
        extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (testResultProvider.currentPanel) {
            testResultProvider.currentPanel.panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            this.viewType,
            panelTitle,
            column || vscode.ViewColumn.One,
            getWebviewOptions(extensionUri),
        );
        testResultProvider.currentPanel = new testResultProvider(panel);
        testResultProvider.currentPanel.panel.webview.onDidReceiveMessage(
            testResultProvider.messageHandler,
            undefined,
            testResultProvider.currentPanel.disposables
        )
        testResultProvider.currentPanel.update(content);

    }

    constructor(panel: vscode.WebviewPanel) {
        this.panel = panel;
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    }

    static setMessageHandler(
        handler: (message: any) => void
    ) {
        testResultProvider.messageHandler = handler;
    }
    // send message to webview
    /*public sendMessageToWebView() {
        this.panel.webview.postMessage({ command: 'refactor' });
    }*/

    public update(content: string) {
        this.panel.webview.html = content;
    }

    public dispose() {
        testResultProvider.currentPanel = undefined;
        this.panel.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}

// webviewの実装例
// https://github.com/microsoft/vscode-extension-samples/blob/main/webview-sample/src/extension.ts
// https://code.visualstudio.com/api/extension-guides/webview
function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    };
}