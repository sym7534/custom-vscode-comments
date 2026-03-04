import * as vscode from 'vscode';

const boldDecoration = vscode.window.createTextEditorDecorationType({
    fontWeight: 'bold',
});

const italicDecoration = vscode.window.createTextEditorDecorationType({
    fontStyle: 'italic',
});

const strikethroughDecoration = vscode.window.createTextEditorDecorationType({
    textDecoration: 'line-through',
});

const hiddenDecoration = vscode.window.createTextEditorDecorationType({
    opacity: '0',
    letterSpacing: '-9999px',
});

function updateDecorations(editor: vscode.TextEditor): void {
    const document = editor.document;
    const text = document.getText();

    const boldRanges: vscode.DecorationOptions[] = [];
    const italicRanges: vscode.DecorationOptions[] = [];
    const strikethroughRanges: vscode.DecorationOptions[] = [];
    const hiddenRanges: vscode.DecorationOptions[] = [];

    const commentRegex = /\/\/(.*)/g;
    let commentMatch: RegExpExecArray | null;

    while ((commentMatch = commentRegex.exec(text)) !== null) {
        const commentBody = commentMatch[1];
        const commentBodyStart = commentMatch.index + 2;

        // Bold: **text**
        const boldRegex = /\*\*(.+?)\*\*/g;
        let boldMatch: RegExpExecArray | null;
        while ((boldMatch = boldRegex.exec(commentBody)) !== null) {
            const contentStart = commentBodyStart + boldMatch.index + 2;
            const contentEnd = contentStart + boldMatch[1].length;

            boldRanges.push({
                range: new vscode.Range(
                    document.positionAt(contentStart),
                    document.positionAt(contentEnd)
                ),
            });
            hiddenRanges.push({
                range: new vscode.Range(
                    document.positionAt(commentBodyStart + boldMatch.index),
                    document.positionAt(commentBodyStart + boldMatch.index + 2)
                ),
            });
            hiddenRanges.push({
                range: new vscode.Range(
                    document.positionAt(contentEnd),
                    document.positionAt(contentEnd + 2)
                ),
            });
        }

        // Strikethrough: ~~text~~
        const strikeRegex = /~~(.+?)~~/g;
        let strikeMatch: RegExpExecArray | null;
        while ((strikeMatch = strikeRegex.exec(commentBody)) !== null) {
            const contentStart = commentBodyStart + strikeMatch.index + 2;
            const contentEnd = contentStart + strikeMatch[1].length;

            strikethroughRanges.push({
                range: new vscode.Range(
                    document.positionAt(contentStart),
                    document.positionAt(contentEnd)
                ),
            });
            hiddenRanges.push({
                range: new vscode.Range(
                    document.positionAt(commentBodyStart + strikeMatch.index),
                    document.positionAt(commentBodyStart + strikeMatch.index + 2)
                ),
            });
            hiddenRanges.push({
                range: new vscode.Range(
                    document.positionAt(contentEnd),
                    document.positionAt(contentEnd + 2)
                ),
            });
        }

        // Italic: *text* (but not **)
        const italicRegex = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g;
        let italicMatch: RegExpExecArray | null;
        while ((italicMatch = italicRegex.exec(commentBody)) !== null) {
            const contentStart = commentBodyStart + italicMatch.index + 1;
            const contentEnd = contentStart + italicMatch[1].length;

            italicRanges.push({
                range: new vscode.Range(
                    document.positionAt(contentStart),
                    document.positionAt(contentEnd)
                ),
            });
            hiddenRanges.push({
                range: new vscode.Range(
                    document.positionAt(commentBodyStart + italicMatch.index),
                    document.positionAt(commentBodyStart + italicMatch.index + 1)
                ),
            });
            hiddenRanges.push({
                range: new vscode.Range(
                    document.positionAt(contentEnd),
                    document.positionAt(contentEnd + 1)
                ),
            });
        }
    }

    editor.setDecorations(boldDecoration, boldRanges);
    editor.setDecorations(italicDecoration, italicRanges);
    editor.setDecorations(strikethroughDecoration, strikethroughRanges);
    editor.setDecorations(hiddenDecoration, hiddenRanges);
}

export function activate(context: vscode.ExtensionContext) {
    if (vscode.window.activeTextEditor) {
        updateDecorations(vscode.window.activeTextEditor);
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                updateDecorations(editor);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                updateDecorations(editor);
            }
        })
    );
}

export function deactivate() {}
