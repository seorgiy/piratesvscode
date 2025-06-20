import * as vscode from 'vscode';
import { Translator } from "./translator";

let translator = new Translator();
const LANGUAGES = [
  'russian',
  'english',
  'french',
  'italian',
  'german',
  'polish',
  'spanish'
];

export function activate(context: vscode.ExtensionContext) {
  LANGUAGES.forEach(language => {
    let commandName = `extension.translate${language}`;
    let command = vscode.commands.registerCommand(commandName, translateHandler.bind(null, language));
    context.subscriptions.push(command);
  });

  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => onChangeConfig));

  vscode.languages.registerHoverProvider('c', {
    provideHover(doc, position, _token) {
      const currentWord = doc.getText(doc.getWordRangeAtPosition(position));
      const translation = translator.translateKey(currentWord);
      if (translation === "") {
        return;
      }

      const contents = new vscode.MarkdownString(translation);
      contents.isTrusted = true;

      return new vscode.Hover(contents);
    }
  });

  // const disposable = vscode.window.onDidChangeTextEditorSelection(onWordClick);
  // context.subscriptions.push(disposable);
}

const translateHandler = (language: string) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage(`Не открыт редактор`);
    return {};
  }

  const document = editor.document;
  const selection = new vscode.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end);
  const fileText = document.getText(selection);
  const fileTextTranslated = translator.translateAllKeys(language, fileText);
  editor.edit(editBuilder => {
    editBuilder.replace(selection, fileTextTranslated);
  });
};

// const onWordClick = (event: vscode.TextEditorSelectionChangeEvent) => {
//   const editor = event.textEditor;
//   const selection = editor.selection;

//   if (!selection.isEmpty) {
//     return;
//   };

//   const wordRange = editor.document.getWordRangeAtPosition(selection.active);
//   if (wordRange) {
//     const word = editor.document.getText(wordRange);
//     const translation = Translator.translateKey(word);
//     if (translation === "") {
//       return;
//     }
//     vscode.window.showInformationMessage(`Вы кликнули по слову: ${translation}`);
//     showHover(translation, wordRange, editor);
//   }
// };

// const showHover = (content: string, range: vscode.Range, editor: vscode.TextEditor) => {
//   const decoration: vscode.DecorationOptions[] = [];
//   decoration.push({ range: range, hoverMessage: content });
//   editor.setDecorations(largeNumberDecorationType, decoration);
// };

// const largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
//   // cursor: 'crosshair',
//   // use a themable color. See package.json for the declaration and default values.
//   backgroundColor: { id: 'myextension.largeNumberBackground' }
// });

// Example: Listening to configuration changes
const onChangeConfig = (event: vscode.ConfigurationChangeEvent) => {
  console.log(event);
  if (event.affectsConfiguration('piratesConfig.preferredLanguage')) {
    console.log("affectsConfiguration!");
    translator.resetLibrary();
  }
};
