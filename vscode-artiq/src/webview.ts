import * as vscode from "vscode";
import * as path from "path";

import * as mutex from "./mutex.js";

export class Provider implements vscode.WebviewViewProvider {

	private view?: vscode.WebviewView;
	private ready: mutex.Lock;
	private html: string;

	constructor(
		private readonly viewType: string,
		private readonly context: vscode.ExtensionContext,
		private readonly actions?: Record<string, ((data: any) => void)>,
	) {
		this.ready = mutex.lock();
		this.html = "";
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this.view = webviewView;
		this.ready.unlock();

		webviewView.webview.options = {
			enableScripts: true, // allow scripts in webviews
			localResourceRoots: [
				vscode.Uri.file(this.context.extensionPath),
			],
		};

		webviewView.webview.onDidReceiveMessage(msg => this.actions?.[msg.action](msg.data));
	}

	public register(): vscode.Disposable {
		return vscode.window.registerWebviewViewProvider(this.viewType, this, {
			// keep webviews alive, even if it is not visible
			webviewOptions: { retainContextWhenHidden: true },
		});
	}

	public async set(text: string) {
		await this.ready.locked;

		this.html = text;
		this.view!.webview.html = this.html;
	}

	public async init() {
		await this.ready.locked;

		let uris = ["tabulator.min.css", "main.css", `${this.viewType}.js`]
			.map(filename => {
				let p = path.join(this.context.extensionPath, "dist/webviews", filename);
				// need to do it like this, because Codium may get the URI scheme wrong otherwise
				return this.view!.webview.asWebviewUri(vscode.Uri.file(p));
			});

		this.html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					style-src ${ this.view!.webview.cspSource } 'unsafe-inline';
					connect-src ${ this.view!.webview.cspSource };
					script-src ${ this.view!.webview.cspSource };
				">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${ uris[0] }" rel="stylesheet">
				<link href="${ uris[1] }" rel="stylesheet">
			</head>
			<body>
				<script type="module" src="${ uris[2] }"></script>
			</body>
			</html>
		`;

		this.view!.webview.html = this.html;
	}

	public async post(msg: any) {
		await this.ready.locked;

		this.view!.webview.postMessage(msg);
	}
}