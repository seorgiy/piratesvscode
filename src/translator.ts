import * as fs from 'fs';
import { join } from 'path';
import { parse } from 'ini';
import { workspace, window, extensions } from 'vscode';
import { LocFile, LocLibrary, LocKey } from "./stormLocalization";

export class Translator {
  #onHoverLanguage: string;
  #library: LocLibrary;
  #languages: string[];

  constructor() {
    this.#languages = getEnumValues('piratesConfig.preferredLanguage') || [];
    this.#library = LocLibrary.create(this.#languages);
    this.#onHoverLanguage = "";
    this.#updateLanguage();
  }

  getLanguages = () => {
    return this.#languages;
  };

  resetLibrary() {
    this.#library = LocLibrary.create(this.#languages);
    this.#updateLanguage();
  }

  translateKey = (word: string) => {
    let resultKey: LocKey = {key: word, value: "", libraryPath: "" };
    if (!word.includes("_")) {
      return resultKey;
    };

    let libraryName = word.match(/(.*)_\d{1,3}/);
    if (libraryName === null){
      return resultKey;
    }

    let locals = this.#initLocFile(this.#onHoverLanguage, libraryName[1]);

    if (locals.absolutePath === "") {
      return resultKey;
    }

    resultKey.value = locals.content[word.toLowerCase()];
    resultKey.libraryPath = locals.absolutePath;
    return resultKey;
  };

  translateAllKeys = (translationLanguage: string, input: string) => {
    const regexp = /(StringFromKey\(.*?\))/g;
    let locals = new LocFile(translationLanguage);
    let locName = "";

    const modifiedSentence = input.replaceAll(regexp, (match: string) => {
      let key = match.match(/\"(.*?)\"/) || [''];
      if (locName === "") {
        let keys = key[1].split("_");
        locals = this.#initLocFile(translationLanguage, keys[0]);
      }
      return `"${locals.content[key[1].toLowerCase()]}"`;
    });

    return modifiedSentence;
  };

  #updateLanguage = () => {
    this.#onHoverLanguage = workspace.getConfiguration('').get('piratesConfig.preferredLanguage') || 'russian';
  };

  #initLocFile = (translationLanguage: string, fileName: string) => {
    const result = this.#library.getFile(translationLanguage, fileName);
    if (result.isParsed)
    {
      return result;
    }

    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      window.showErrorMessage('Нет открытых рабочих папок.');
      return result;
    }
    const editor = window.activeTextEditor;
    if (!editor) {
      window.showErrorMessage(`Не открыт редактор`);
      return result;
    }

    const slash = process.platform === "win32" ? "\\" : "/";
    const filepath = editor.document.fileName.split("Program" + slash);
    const rootPath = filepath[filepath.length - 2];
    const iniPath = join(rootPath, "Resource", "INI", "texts", "Localization_Assets.ini");
    const iniContent = fs.readFileSync(iniPath, 'utf-8');
    const config = parse(iniContent);
    const localsPath = config[fileName];
    if (!localsPath) {
      return result;
    }

    const fileFolder = join(rootPath, "Resource", "INI", "texts", translationLanguage, join(...localsPath.split("\\")));
    const filePath: fs.PathOrFileDescriptor = getFileExistIgnoreRegister(fileFolder, fileName);
    if (!fs.existsSync(filePath)) {
      return result;
    }

    const content = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    result.parseTxt(content);
    result.absolutePath = filePath;
    result.filename = fileName;
    this.#library.addFile(result);
    return result;
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

const getEnumValues = (settingKey: string): string[] | undefined => {
  const extension = extensions.getExtension('Seorgiy.piratesvscode');
  if (!extension) {
      return undefined;
  }
  const packageJSON = extension.packageJSON;
  const properties = packageJSON.contributes?.configuration?.properties;
  if (!properties || !properties[settingKey]) {
      return undefined;
  }

  const setting = properties[settingKey];
  if (setting.enum && Array.isArray(setting.enum)) {
      return setting.enum;
  }

  return undefined;
};
