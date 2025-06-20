import { MarkdownString, window, Hover, Uri, TextDocument, Position } from "vscode";
import { Translator } from "./translator";
import { LocalKey } from "./translator";

export const OnHoverTranslation = (doc: TextDocument, translator: Translator, position: Position) => {
  const currentWord = doc.getText(doc.getWordRangeAtPosition(position));
  const localKey: LocalKey = translator.translateKey(currentWord);
  if (localKey.value === "") {
    return;
  }

  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }

  const goToTranslation = Uri.parse(`command:piratesvscode.openCurrentKeyFile?${encodeURIComponent(JSON.stringify([localKey]))}`);
  const contents = new MarkdownString(`${localKey.value}\n\n[📝](${goToTranslation})`);
  contents.isTrusted = true;

  return new Hover(contents);
};