"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translater = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const vscode = __importStar(require("vscode"));
class Translater {
    replaceLocalizationKeys = (language, input) => {
        const regexp = /StringFromKey\(\".*\"\)?/g;
        let locals = {};
        let locName = "";
        const modifiedSentence = input.replaceAll(regexp, (match) => {
            let key = match.match(/\"(.*?)\"/) || [''];
            if (locName === "") {
                locName = key[1].split("_")[0];
                locals = this.initLocFile(language, locName);
            }
            return `"${locals[key[1]]}"`;
        });
        return modifiedSentence;
    };
    initLocFile = (language, fileName) => {
        const result = {};
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
    fillLocFile = (locals, text, _fileName) => {
        let array = text.split("}");
        array.pop();
        array.forEach(x => {
            let array2 = x.split("{");
            locals[array2[0].trim()] = array2[1].trim();
        });
    };
    capitalizeFirstLetter = (str) => {
        if (str.length === 0) {
            return "";
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
}
exports.Translater = Translater;
//# sourceMappingURL=translater.js.map