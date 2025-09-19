import { commands, Range, ExtensionContext, workspace, window, languages, ConfigurationChangeEvent, extensions, TextEditor } from "vscode";
import { Translator } from "./translator";
import { openCurrentKeyFile } from "./openCurrentKeyFile";
import { LogOpener } from "./openLogs";
import { OnHoverTranslation } from "./onHoverTranslation";
import { LocKey } from "./stormLocalization";

let translator = new Translator();
let logOpener = new LogOpener();

export function activate(context: ExtensionContext) {
  translator.getLanguages().forEach(language => {
    let commandName = `piratesvscode.translate${language}`;
    let command = commands.registerCommand(commandName, translateHandler.bind(null, language));
    context.subscriptions.push(command);
  });

  commands.registerCommand("piratesvscode.openCurrentKeyFile", (locKey: LocKey) => {
    openCurrentKeyFile.execute(locKey);
  });

  commands.registerCommand("piratesvscode.openLogsAll", () => {
    logOpener.execute("all");
  });
  commands.registerCommand("piratesvscode.openLogsSystem", () => {
    logOpener.execute("system");
  });
  commands.registerCommand("piratesvscode.openLogsCompile", () => {
    logOpener.execute("compile");
  });
  commands.registerCommand("piratesvscode.openLogsError", () => {
    logOpener.execute("error");
  });

  commands.registerCommand("piratesvscode.coordinatesX", () => {
    const editor = window.activeTextEditor;
    if (!editor) {
      return {};
    }

    askUserNumber().then(numberToAdd => { 
      if (numberToAdd !== undefined) { changeCoordinates(numberToAdd, numberToAdd ,editor, 0, 2); };
    });
  });

  commands.registerCommand("piratesvscode.coordinatesY", () => {
    const editor = window.activeTextEditor;
    if (!editor) {
      return {};
    }

    askUserNumber().then(numberToAdd => { 
      if (numberToAdd !== undefined) { changeCoordinates(numberToAdd, numberToAdd, editor, 1, 3); };
    });
  });

  commands.registerCommand("piratesvscode.coordinatesYResize", () => {
    const editor = window.activeTextEditor;
    if (!editor) {
      return {};
    }

    askUserNumber().then(numberToAdd => { 
      if (numberToAdd !== undefined) { changeCoordinates(-numberToAdd/2, numberToAdd/2, editor, 1, 3); };
    });
  });

  commands.registerCommand("piratesvscode.coordinatesXResize", () => {
    const editor = window.activeTextEditor;
    if (!editor) {
      return {};
    }

    askUserNumber().then(numberToAdd => { 
      if (numberToAdd !== undefined) { changeCoordinates(-numberToAdd/2, numberToAdd/2, editor, 0, 2); };
    });
  });

  context.subscriptions.push(workspace.onDidChangeConfiguration(e => onChangeConfig));

  languages.registerHoverProvider('c', {
    provideHover(doc, position, _token) {
      return OnHoverTranslation(doc, translator, position);
    }
  });
}

const translateHandler = (language: string) => {
  const editor = window.activeTextEditor;
  if (!editor) {
    return {};
  }

  const document = editor.document;
  const selection = new Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end);
  const fileText = document.getText(selection);
  const fileTextTranslated = translator.translateAllKeys(language, fileText);
  editor.edit(editBuilder => {
    editBuilder.replace(selection, fileTextTranslated);
  });
};

const onChangeConfig = (event: ConfigurationChangeEvent) => {
  if (event.affectsConfiguration('piratesConfig.preferredLanguage')) {
    translator.resetLibrary();
  }
};


function askUserNumber(): Thenable<number | undefined> {
  return window.showInputBox({
    prompt: 'Enter number for coordinates shift',
    validateInput: (value) => {
      return isNaN(Number(value)) ? 'Enter correct number' : null;
    }
  }).then(input => {
    if (input === undefined) {
      // Пользователь отменил ввод
      return undefined;
    }
    const num = Number(input);
    return num;
  });
}

function changeCoordinates(numberToAddStart: number, numberToAddEnd: number, editor: TextEditor, posA: number, posB: number)
{
  editor.edit(editBuilder => {
    for (const selection of editor.selections) {
      let text = editor.document.getText(selection);

      if (text.length === 0) {
        window.showInformationMessage('Select some coordinates, for example: 12,12,24,24');
        continue;
      }

      const groupRegex = /(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)/g;

      let newText = text.replace(groupRegex, (match, g1, g2, g3, g4) => {
        const numbers = [g1, g2, g3, g4].map(n => Number(n));
        // Проверяем на NaN
        if (numbers.some(n => isNaN(n))) {
          return match;
        }

        numbers[posA] += numberToAddStart;
        numbers[posB] += numberToAddEnd;
        return numbers.join(',');
      });

      editBuilder.replace(selection, newText);
    }
  });
}