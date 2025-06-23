import { window, Uri, workspace, Selection, Range, TextEditorRevealType, commands } from "vscode";
import { join } from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';

export class LogOpener {
  #logsPath: string;

  constructor() {
    if (process.platform === "win32") {
      this.#logsPath = join(process.env.USERPROFILE || "", "Documents", "My Games", "Caribbean Legend", "Logs") || "";
    }
    else if (process.platform === "linux") {
      this.#logsPath = "";
      getUserProfileFromWSL()
        .then((userProfile) => {
          this.#logsPath = join(userProfile, "Documents", "My Games", "Caribbean Legend", "Logs") || "";
        })
        .catch(_error => {
          this.#logsPath = "";
        });
    }
    else {
      this.#logsPath = "";
    }
  }

  public execute(type: string): void {
    switch (type) {
      case "all":
        openFile(join(this.#logsPath, "compile.log"))
          .then(() => {
            openFile(join(this.#logsPath, "error.log"))
              .then(() => {
                openFile(join(this.#logsPath, "system.log"));
              });
          });
        break;
      case "compile":
        openFile(join(this.#logsPath, "compile.log"));
        break;
      case "system":
        openFile(join(this.#logsPath, "system.log"));
        break;
      case "error":
        openFile(join(this.#logsPath, "error.log"));
        break;
    }
  }
}

async function openFile(filePath: string) {
  let isFound = fs.existsSync(filePath);
  if (!isFound) {
    window.showErrorMessage('Файлы логов не найдены по адресу: ' + filePath);
    return;
  }
  const uri = Uri.file(filePath);
  const document = await workspace.openTextDocument(uri);
  await window.showTextDocument(document, { preview: false });
};

function getUserProfileFromWSL(): Promise<string> {
  return new Promise((resolve, reject) => {
    cp.exec(`wslpath "$(powershell.exe '$env:USERPROFILE')"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}