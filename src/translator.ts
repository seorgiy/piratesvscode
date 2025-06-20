import * as path from 'path';
import * as fs from 'fs';
import { parse } from 'ini';
import * as vscode from 'vscode';
import { log } from 'console';

interface LocFile {
  [key: string]: string
}

interface LocLibrary {
  [key: string]: LocFile
}

export class Translator {
  #language: string;
  #library: LocLibrary;

  constructor() {
    this.#library = {};
    this.#language = vscode.workspace.getConfiguration('').get('piratesConfig.preferredLanguage') || 'russian';
  }

  resetLibrary()
  {
    this.#library = {};
    this.#language = vscode.workspace.getConfiguration('').get('piratesConfig.preferredLanguage') || 'russian';
  }

  translateKey = (word: string) => {
    console.log("translateKey: " + word);
    console.log(this.#library);
    if (!word.includes("_")) {
      return "";
    };

    let parts = word.split("_");
    let locals = this.#initLocFile(this.#language, parts[0]);

    if (isEmptyObject(locals)) {
      return "";
    }
    return `${locals[word.toLowerCase()]}`;
  };

  translateAllKeys = (language: string, input: string) => {
    const regexp = /StringFromKey\((.*)\);?/g;
    let locals: LocFile = {};
    let locName = "";

    const modifiedSentence = input.replaceAll(regexp, (match: string) => {
      let key = match.match(/\"(.*?)\"/) || [''];
      if (locName === "") {
        let keys = key[1].split("_");
        locals = this.#initLocFile(language, keys[0]);
      }
      return `"${locals[key[1].toLowerCase()]}"`;
    });

    return modifiedSentence;
  };

  #initLocFile = (language: string, fileName: string) => {
    if (this.#library.hasOwnProperty(fileName))
    {
      console.log('возвращаем кэш');
      return this.#library[fileName];
    }

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
    const iniPath = path.join(rootPath, "Resource", "INI", "texts", "Localization_Assets.ini");
    const iniContent = fs.readFileSync(iniPath, 'utf-8');
    const config = parse(iniContent);
    const localsPath = config[fileName];
    if (!localsPath) {
      return {};
    }

    const fileFolder = path.join(rootPath, "Resource", "INI", "texts", language, path.join(...localsPath.split("\\")));
    const filePath: fs.PathOrFileDescriptor = getFileExistIgnoreRegister(fileFolder, fileName);
    if (!fs.existsSync(filePath)) {
      return {};
    }

    const content = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    this.#fillLocFile(result, content);

    this.#library[fileName] = result;
    return result;
  };

  // Разбиваем сначала по }, потом по { и убираем лишние символы, чтобы получить key: value тупа
  #fillLocFile = (locals: LocFile, text: string) => {
    let array: string[] = text.split("}");
    array.pop();
    array.forEach(x => {
      let array2: string[] = x.split("{");
      locals[array2[0].trim().toLowerCase()] = array2[1].trim();
    });
  };
}

const isEmptyObject = (obj: any) => {
  return (
    Object.getPrototypeOf(obj) === Object.prototype &&
    Object.getOwnPropertyNames(obj).length === 0 &&
    Object.getOwnPropertySymbols(obj).length === 0
  );
};

const capitalizeFirstLetter = (str: string): string => {
  if (str.length === 0) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const lowerFirstLetter = (str: string): string => {
  if (str.length === 0) {
    return "";
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
};

const getFileExistIgnoreRegister = (folder: string, filename: string) => {
  let resultPath = path.join(folder, lowerFirstLetter(filename) + ".txt");
  let isFound = fs.existsSync(resultPath);
  if (!isFound) {
    resultPath = path.join(folder, capitalizeFirstLetter(filename) + ".txt");
    isFound = fs.existsSync(resultPath);
  }

  if (!isFound) {
    return path.join('');
  }
  return resultPath;
};
