import { window, Uri, workspace, Selection, Range, TextEditorRevealType } from "vscode";
import { LocalKey } from "./translator";

export class openCurrentKeyFile {
  public static execute(locKey: LocalKey): void {
    openFile(locKey.libraryPath).then(() => {
      const editor = window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      const keyPos = document.getText().indexOf(locKey.key);
      if (keyPos === -1) {
        return;
      }

      const startPos = document.positionAt(keyPos);
      const endPos = document.positionAt(keyPos + locKey.key.length);
      editor.selection = new Selection(startPos, endPos);
      editor.revealRange(new Range(startPos, endPos), TextEditorRevealType.InCenterIfOutsideViewport);

    }, undefined);
  }
}

async function openFile(filePath: string) {
  const uri = Uri.file(filePath);
  const document = await workspace.openTextDocument(uri);
  await window.showTextDocument(document);
};
