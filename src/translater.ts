import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

interface LocFile {
  [key: string]: string
}

export class Translater {

  replaceLocalizationKeys = (input: string) => {
    const regexp = /StringFromKey\(\"(.*)\"\)?/g;
    let locals: LocFile = {};
    let locName = "";

    const modifiedSentence = input.replaceAll(regexp, (match: string, p1: string, _p2: string, _p3: string) => {
      if (locName === "") {
        locName = p1.split("_")[0];
        locals = this.initLocObj(locName);
      }
      return `"${locals[p1]}"`;
    });

    return modifiedSentence;
  };

  replaceByKey = (match: string, p1: string, _p2: string, _p3: string) => {
    return p1;
  };

  initLocObj = (fileName: string) => {
    const result: LocFile = {};

    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Нет открытых рабочих папок.');
        return {};
      }

      const rootPath = workspaceFolders[0].uri.fsPath;
      const filePath = path.join(rootPath, "Resource", "INI", "texts", "russian", "Localization_Assets", `${this.capitalizeFirstLetter(fileName)}.txt`);

      if (!fs.existsSync(filePath)) {
        vscode.window.showErrorMessage(`Файл не найден: ${filePath}`);
        return {};
      }

      // Читаем содержимое файла
      const content = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
      this.fillLocObject(result, content, fileName);

    } catch (err: any) {
      vscode.window.showErrorMessage(`Ошибка: ${err.message}`);
    }

    return result;
  };

  fillLocObject = (locals: LocFile, text: string, _fileName: string) => {
    // Разбиваем сначала по }, потом по { и убираем лишние символы, чтобы получить key: value тупа
    let array: string[] = text.split("}");
    array.pop();
    array.forEach(x => {
      let array2: string[] = x.split("{");
      locals[array2[0].trim()] = array2[1].trim();
    });

    console.log(locals['personality_19']);
  };

  capitalizeFirstLetter = (str: string): string => {
    if (str.length === 0) {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
}
