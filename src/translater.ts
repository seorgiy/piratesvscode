import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

interface LocFile {
  [key: string]: string
}

export class Translater {

  replaceLocalizationKeys = (language: string, input: string) => {
    const regexp = /StringFromKey\(\".*\"\)?/g;
    let locals: LocFile = {};
    let locName = "";

    const modifiedSentence = input.replaceAll(regexp, (match: string) => {
      let key = match.match(/\"(.*?)\"/) || [''];
      if (locName === "") {
        locName = key[1].split("_")[0];
        locals = this.initLocFile(language, locName);
      }
      return `"${locals[key[1]]}"`;
    });

    return modifiedSentence;
  };

  initLocFile = (language: string, fileName: string) => {
    const result: LocFile = {};

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('Нет открытых рабочих папок.');
      return {};
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage(`Не открыт редактор`);
      return {};
    }

    const filepath = editor.document.fileName.split("Program/");
    const rootPath = filepath[filepath.length - 2];
    const filePath = path.join(rootPath, "Resource", "INI", "texts", language, "Localization_Assets", `${this.capitalizeFirstLetter(fileName)}.txt`);

    if (!fs.existsSync(filePath)) {
      vscode.window.showErrorMessage(`Файл не найден: ${filePath}`);
      return {};
    }

    const content = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    this.fillLocFile(result, content, fileName);

    return result;
  };

  // Разбиваем сначала по }, потом по { и убираем лишние символы, чтобы получить key: value тупа
  fillLocFile = (locals: LocFile, text: string, _fileName: string) => {
    let array: string[] = text.split("}");
    array.pop();
    array.forEach(x => {
      let array2: string[] = x.split("{");
      locals[array2[0].trim()] = array2[1].trim();
    });
  };

  capitalizeFirstLetter = (str: string): string => {
    if (str.length === 0) {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
}
