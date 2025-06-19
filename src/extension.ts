import * as vscode from 'vscode';
import { Translater } from "./translater";

let translater = new Translater();
let myStatusBarItem: vscode.StatusBarItem;
const languages = [
	'russian',
	'english',
	'french',
	'italian',
	'german',
	'polish',
	'spanish'
];

export function activate(context: vscode.ExtensionContext) {
	languages.forEach(language => {
		let commandName = `extension.translate${language}`;
		let command = vscode.commands.registerCommand(commandName, translateHandler.bind(null, language));
		context.subscriptions.push(command);
	});

	// const myCommandId = 'extension.showSelectionCount';
	// context.subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
	// 	const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
	// 	vscode.window.showInformationMessage(`Yeah, ${n} line(s) selected... Keep going!`);
	// }));

	// myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	// myStatusBarItem.command = myCommandId;
	// context.subscriptions.push(myStatusBarItem);
	// context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
	// context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem));
	// updateStatusBarItem();
}

// function updateStatusBarItem(): void {
// 	const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
// 	if (n > 0) {
// 		myStatusBarItem.text = `$(megaphone) ${n} line(s) selected`;
// 		myStatusBarItem.show();
// 	} else {
// 		myStatusBarItem.hide();
// 	}
// }

// function getNumberOfSelectedLines(editor: vscode.TextEditor | undefined): number {
// 	let lines = 0;
// 	if (editor) {
// 		lines = editor.selections.reduce((prev, curr) => prev + (curr.end.line - curr.start.line), 0);
// 	}
// 	return lines;
// }

const translateHandler = (language: string) => {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage(`Не открыт редактор`);
		return {};
	}

	const document = editor.document;
	const selection = new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end);
	const fileText = document.getText(selection);
	const fileTextTranslated = translater.replaceLocalizationKeys(language, fileText);
	editor.edit(editBuilder => {
		editBuilder.replace(selection, fileTextTranslated);
	});
};
