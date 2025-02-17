import * as vscode from "vscode";
import { panelTitle } from "./ui";
import { TestCaseViewState } from "./viewState";

const panelId = "testResults";

export class WebView {
    static currentPanel: WebView | undefined;
    // static messageHandler: (message: any) => void;
    static readonly viewType = panelId;
    private readonly panel: vscode.WebviewPanel;
    private currentViewState: TestCaseViewState
    private disposables: vscode.Disposable[] = [];

    viewState() {
        return this.currentViewState;
    }

    static createOrShow(
        viewState: TestCaseViewState,
        content: string,
        extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (WebView.currentPanel) {
            WebView.currentPanel.update(viewState, content);
            WebView.currentPanel.panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            this.viewType,
            panelTitle,
            column || vscode.ViewColumn.One,
            getWebviewOptions(extensionUri),
        );
        WebView.currentPanel = new WebView(panel, viewState);
        /* WebView.currentPanel.panel.webview.onDidReceiveMessage(
            WebView.messageHandler,
            undefined,
            WebView.currentPanel.disposables
        )*/
        WebView.currentPanel.update(viewState, content);

    }

    constructor(panel: vscode.WebviewPanel, viewState: TestCaseViewState) {
        this.panel = panel;
        this.currentViewState = viewState;
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    }

    /*static setMessageHandler(
        handler: (message: any) => void
    ) {
        WebView.messageHandler = handler;
    }*/
    // send message to webview
    /*public sendMessageToWebView() {
        this.panel.webview.postMessage({ command: 'refactor' });
    }*/

    public update(state: TestCaseViewState, content: string) {
        this.currentViewState = state;
        this.panel.webview.html = content;
    }

    public dispose() {
        WebView.currentPanel = undefined;
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