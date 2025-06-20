/**
```javascript
  content: { RPG_Utilite_1: value, RPG_Utilite_2: value}
  filename: RPG_Utilite
  language: russian
  absolutePath: ../RPG_Utilite.txt
```
**/
export class LocFile {
  absolutePath: string;
  filename: string;
  content: { [key: string]: string };
  language: string;
  isParsed: boolean;

  constructor(language: string) {
    this.absolutePath = "";
    this.content = {};
    this.isParsed = false;
    this.filename = "";
    this.language = language;
  }

  /**
  Breaking the string by { and }, transforming "key1{value1} key2{value2}" string into {key1: value1, key2: value2} object
  **/
  parseTxt = (text: string) => {
    let array: string[] = text.split("}");
    array.pop();
    array.forEach(x => {
      let array2: string[] = x.split("{");
      this.content[array2[0].trim().toLowerCase()] = array2[1].trim();
    });
    this.isParsed = true;
  };

  static create = (language: string) => {
    return new LocFile(language);
  };
}

export interface LocKey {
  key: string,
  value: string,
  libraryPath: string
}

interface LanguageFiles {
  [keys: string]: LocFile;
}

/**
```javascript
russian:
  RPG_Utilite: { RPG_Utilite_1: value, RPG_Utilite_2: value}
english:
  RPG_Utilite: { RPG_Utilite_1: value, RPG_Utilite_2: value}
```
**/
export class LocLibrary {
  private data: { [language: string]: LanguageFiles } = {};

  constructor(languages: string[]) {
    languages.forEach(language => {
      this.data[language] = {};
    });
  }

  addFile = (file: LocFile) => {
    this.data[file.language][file.filename] = file;
    return;
  };
  
  getFile = (language: string, fileName: string): LocFile => {
    if (this.data[language].hasOwnProperty(fileName)) {
      return this.data[language][fileName];
    }
    return new LocFile(language);
  };

  static create = (languages: string[]) => {
    return new LocLibrary(languages);
  };
}