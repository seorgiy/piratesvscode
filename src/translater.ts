import * as path from 'path';
import * as fs from 'fs';
import { parse } from 'ini';
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
      return `"${locals[key[1].toLowerCase()]}"`;
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
    fileName = this.capitalizeFirstLetter(fileName);
    const rootPath = filepath[filepath.length - 2];
    const iniPath = path.join(rootPath, "Resource", "INI", "texts", "Localization_Assets.ini");
    const iniContent = fs.readFileSync(iniPath, 'utf-8');
    const config = parse(iniContent);
    const filePath = path.join(rootPath, "Resource", "INI", "texts", language, path.join(...config[fileName].split("\\")), `${fileName}.txt`);

    if (!fs.existsSync(filePath)) { 
      vscode.window.showErrorMessage(`Файл не найден: ${filePath}`);
      return {};
    }

    const content = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    this.fillLocFile(result, content);

    return result;
  };

  // Разбиваем сначала по }, потом по { и убираем лишние символы, чтобы получить key: value тупа
  fillLocFile = (locals: LocFile, text: string) => {
    let array: string[] = text.split("}");
    array.pop();
    array.forEach(x => {
      let array2: string[] = x.split("{");
      locals[array2[0].trim().toLowerCase()] = array2[1].trim();
    });
  };

  capitalizeFirstLetter = (str: string): string => {
    if (str.length === 0) {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
}
