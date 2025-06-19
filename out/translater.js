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
    replaceLocalizationKeys = (input) => {
        const regexp = /StringFromKey\(\"(.*)\"\)?/g;
        let locals = {};
        let locName = "";
        const modifiedSentence = input.replaceAll(regexp, (match, p1, _p2, _p3) => {
            if (locName === "") {
                locName = p1.split("_")[0];
                locals = this.initLocObj(locName);
            }
            return `"${locals[p1]}"`;
        });
        return modifiedSentence;
    };
    replaceByKey = (match, p1, _p2, _p3) => {
        return p1;
    };
    initLocObj = (fileName) => {
        const result = {};
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
        }
        catch (err) {
            vscode.window.showErrorMessage(`Ошибка: ${err.message}`);
        }
        return result;
    };
    fillLocObject = (locals, text, _fileName) => {
        // Разбиваем сначала по }, потом по { и убираем лишние символы, чтобы получить key: value тупа
        let array = text.split("}");
        array.pop();
        array.forEach(x => {
            let array2 = x.split("{");
            locals[array2[0].trim()] = array2[1].trim();
        });
        console.log(locals['personality_19']);
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