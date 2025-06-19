"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const translater_1 = require("./translater");
let translater = new translater_1.Translater();
let myStatusBarItem;
const languages = [
    'russian',
    'english',
    'french',
    'italian',
    'german',
    'polish',
    'spanish'
];
function activate(context) {
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
const translateHandler = (language) => {
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
//# sourceMappingURL=extension.js.map