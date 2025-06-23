import { commands, Range, ExtensionContext, workspace, window, languages, ConfigurationChangeEvent, extensions } from "vscode";
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
