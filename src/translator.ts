import * as fs from 'fs';
import { join } from 'path';
import { parse } from 'ini';
import { workspace, window } from 'vscode';

interface LocFile {
  [key: string]: string,
  absolutePath: string
}

interface LocLibrary {
  [key: string]: LocFile
}

export interface LocalKey {
  key: string,
  value: string,
  libraryPath: string
}

export class Translator {
  #language: string;
  #library: LocLibrary;

  constructor() {
    this.#library = {};
    this.#language = "";
    this.#updateLanguage();
  }

  resetLibrary() {
    this.#library = {};
    this.#updateLanguage();
  }

  translateKey = (word: string) => {
    let resultKey: LocalKey = {key: word, value: "", libraryPath: "" };
    if (!word.includes("_")) {
      return resultKey;
    };

    let libraryName = word.match(/(.*)_\d{1,3}/);
    if (libraryName === null){
      return resultKey;
    }
    let locals = this.#initLocFile(this.#language, libraryName[1]);

    if (locals.absolutePath === "") {
      return resultKey;
    }

    resultKey.value = locals[word.toLowerCase()];
    resultKey.libraryPath = locals.absolutePath;
    return resultKey;
  };

  translateAllKeys = (language: string, input: string) => {
    const regexp = /StringFromKey\((.*)\);?/g;
    let locals: LocFile = { absolutePath: '' };
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

  #updateLanguage = () => {
    this.#language = workspace.getConfiguration('').get('piratesConfig.preferredLanguage') || 'russian';
  };

  #initLocFile = (language: string, fileName: string) => {
    if (this.#library.hasOwnProperty(fileName)) {
      return this.#library[fileName];
    }

    const result: LocFile = { absolutePath: ''};

    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      window.showErrorMessage('Нет открытых рабочих папок.');
      return { absolutePath: "" };
    }
    const editor = window.activeTextEditor;
    if (!editor) {
      window.showErrorMessage(`Не открыт редактор`);
      return { absolutePath: "" };
    }

    const slash = process.platform === "win32" ? "\\" : "/";
    const filepath = editor.document.fileName.split("Program" + slash);
    const rootPath = filepath[filepath.length - 2];
    const iniPath = join(rootPath, "Resource", "INI", "texts", "Localization_Assets.ini");
    const iniContent = fs.readFileSync(iniPath, 'utf-8');
    const config = parse(iniContent);
    const localsPath = config[fileName];
    if (!localsPath) {
      return { absolutePath: "" };
    }

    const fileFolder = join(rootPath, "Resource", "INI", "texts", language, join(...localsPath.split("\\")));
    const filePath: fs.PathOrFileDescriptor = getFileExistIgnoreRegister(fileFolder, fileName);
    if (!fs.existsSync(filePath)) {
      return { absolutePath: "" };
    }

    const content = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    this.#fillLocFile(result, content);
    this.#library[fileName] = result;
    result.absolutePath = filePath;
    return result;
  };

  /**
  Breaking the string by { and }, transforming "key1{value1} key2{value2}" string into {key1: value1, key2: value2} object
  **/
  #fillLocFile = (locals: LocFile, text: string) => {
    let array: string[] = text.split("}");
    array.pop();
    array.forEach(x => {
      let array2: string[] = x.split("{");
      locals[array2[0].trim().toLowerCase()] = array2[1].trim();
    });
  };
}

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

/**
@returns file path for fileName or FileName in the same folder.
@returns "" if file not exist
**/
const getFileExistIgnoreRegister = (folder: string, filename: string) => {
  let resultPath = join(folder, lowerFirstLetter(filename) + ".txt");
  let isFound = fs.existsSync(resultPath);
  if (!isFound) {
    resultPath = join(folder, capitalizeFirstLetter(filename) + ".txt");
    isFound = fs.existsSync(resultPath);
  }

  if (!isFound) {
    return join('');
  }
  return resultPath;
};
