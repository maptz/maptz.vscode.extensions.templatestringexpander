'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs");
class vscodeinterop {
    static listCoreNodeModules() {
        var retval = [];
        var rs = fs.readdirSync(`${vscode.env.appRoot}/node_modules.asar/`);
        for (var l of rs.entries()) {
            retval.push(l[1]);
        }
        return retval;
    }
    /**
* Returns a node module installed with VSCode, or null if it fails.
*/
    static getCoreNodeModule(moduleName) {
        //You can't npm install these for some reason
        //See https://github.com/Microsoft/vscode/issues/46281
        try {
            return require(`${vscode.env.appRoot}/node_modules.asar/${moduleName}`);
        }
        catch (err) { }
        try {
            return require(`${vscode.env.appRoot}/node_modules/${moduleName}`);
        }
        catch (err) { }
        return null;
    }
    static csharpsyntax() {
        var r = `${vscode.env.appRoot}/extensions/csharp/syntaxes/csharp.tmLanguage.json`;
        var s = fs.readFileSync(r, "utf8");
        var ret = JSON.parse(s);
        return ret;
    }
}
exports.vscodeinterop = vscodeinterop;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "string-template-expander" is now active!');
    const languageIds = {
        csharp: ['csharp'],
        javascript: ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']
    };
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('templateStringExpander.convertToTemplateString', () => {
        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');
        var ate = vscode.window.activeTextEditor;
        if (!ate)
            return;
        if (languageIds.csharp.includes(ate.document.languageId)) {
            convertCSStringToTemplate(ate).catch(err => {
                throw err;
            });
        }
        else if (languageIds.javascript.includes(ate.document.languageId)) {
            convertJavascriptStringToTemplate(ate).catch(err => {
                throw err;
            });
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function getTextmateRegistry() {
    const textmate = vscodeinterop.getCoreNodeModule('vscode-textmate');
    var grammarPaths = {
        'source.cs': `${vscode.env.appRoot}/extensions/csharp/syntaxes/csharp.tmLanguage.json`,
        'source.js': `${vscode.env.appRoot}/extensions/javascript/syntaxes/JavaScript.tmLanguage.json`,
        'source.jsx': `${vscode.env.appRoot}/extensions/javascript/syntaxes/JavaScriptReact.tmLanguage.json`,
        'source.ts': `${vscode.env.appRoot}/extensions/typescript-basics/syntaxes/TypeScript.tmLanguage.json`,
        'source.tsx': `${vscode.env.appRoot}/extensions/typescript-basics/syntaxes/TypeScriptReact.tmLanguage.json`
    };
    var registry = new textmate.Registry({
        loadGrammar: function (scopeName) {
            var path = grammarPaths[scopeName];
            if (path) {
                return new Promise((c, e) => {
                    fs.readFile(path, (error, content) => {
                        if (error) {
                            e(error);
                        }
                        else {
                            var rawGrammar = textmate.parseRawGrammar(content.toString(), path);
                            c(rawGrammar);
                        }
                    });
                });
            }
            return null;
        }
    });
    return registry;
}
function convertJavascriptStringToTemplate(textEditor) {
    return __awaiter(this, void 0, void 0, function* () {
        var registry = getTextmateRegistry();
        var grammar = yield registry.loadGrammar('source.tsx').catch(err => {
            debugger;
        });
        ;
        var currentLine = textEditor.document.lineAt(textEditor.selection.start.line).text;
        var lineTokens = grammar.tokenizeLine(currentLine).tokens;
        var currentToken = null;
        var currentTokenIndex = -1;
        for (let i = 0; i < lineTokens.length; i++) {
            let tok = lineTokens[i];
            if (tok.startIndex <= textEditor.selection.start.character && tok.endIndex >= textEditor.selection.start.character) {
                currentToken = tok;
                currentTokenIndex = i;
                break;
            }
        }
        if (!currentToken)
            return;
        if (!currentToken.scopes.some(p => p == "string.quoted.double.tsx" || p == "string.quoted.single.tsx")) {
            return;
        }
        //:"punctuation.definition.string.begin.cs"
        var isStartToken = (currentToken.scopes.includes("punctuation.definition.string.begin.tsx"));
        var isEndToken = (currentToken.scopes.includes("punctuation.definition.string.end.tsx"));
        //Look for the start token.
        var startToken = null;
        var endToken = null;
        if (!isStartToken) {
            for (let i = currentTokenIndex; i >= 0; i--) {
                let tok = lineTokens[i];
                if (tok.scopes.includes("punctuation.definition.string.begin.tsx")) {
                    startToken = tok;
                    break;
                }
            }
        }
        else {
            startToken = currentToken;
        }
        if (!isEndToken) {
            for (let i = currentTokenIndex; i < lineTokens.length; i++) {
                let tok = lineTokens[i];
                if (tok.scopes.includes("punctuation.definition.string.end.tsx")) {
                    endToken = tok;
                    break;
                }
            }
        }
        else {
            endToken = currentToken;
        }
        // if we need to add brackets as in <div id='a' /> to <div id={`a`} />
        const isJSXAttribute = currentToken.scopes.includes('meta.tag.attributes.tsx') && !currentToken.scopes.includes('meta.embedded.expression.tsx');
        textEditor.edit(editor => {
            var firstCharRange = new vscode.Range(new vscode.Position(textEditor.selection.start.line, startToken.startIndex), new vscode.Position(textEditor.selection.start.line, startToken.startIndex + 1));
            var lastCharRange = new vscode.Range(new vscode.Position(textEditor.selection.start.line, endToken.startIndex), new vscode.Position(textEditor.selection.start.line, endToken.startIndex + 1));
            editor.replace(firstCharRange, isJSXAttribute ? "{`" : "`");
            editor.replace(lastCharRange, isJSXAttribute ? "`}" : "`");
        });
    });
}
function convertCSStringToTemplate(textEditor) {
    return __awaiter(this, void 0, void 0, function* () {
        var registry = getTextmateRegistry();
        var grammar = yield registry.loadGrammar('source.cs');
        var currentLine = textEditor.document.lineAt(textEditor.selection.start.line).text;
        var lineTokens = grammar.tokenizeLine(currentLine).tokens;
        var currentToken = null;
        var currentTokenIndex = -1;
        for (let i = 0; i < lineTokens.length; i++) {
            let tok = lineTokens[i];
            if (tok.startIndex <= textEditor.selection.start.character && tok.endIndex >= textEditor.selection.start.character) {
                currentToken = tok;
                currentTokenIndex = i;
                break;
            }
        }
        if (!currentToken)
            return;
        if (currentToken.scopes.filter(p => p == "string.quoted.double.cs").length == 0) {
            return;
        }
        //:"punctuation.definition.string.begin.cs"
        var isStartToken = (currentToken.scopes.filter(p => p == "punctuation.definition.string.begin.cs").length > 0);
        var isEndToken = (currentToken.scopes.filter(p => p == "punctuation.definition.string.end.cs").length > 0);
        //Look for the start token.
        var startToken = currentToken;
        if (!isStartToken) {
            for (let i = currentTokenIndex; i >= 0; i--) {
                let tok = lineTokens[i];
                if (tok.scopes.filter(p => p == "punctuation.definition.string.begin.cs").length > 0) {
                    startToken = tok;
                    break;
                }
            }
        }
        var firstChar = currentLine.substr(startToken.startIndex, 1);
        if (firstChar != "$") {
            textEditor.edit(editor => {
                editor.insert(new vscode.Position(textEditor.selection.start.line, startToken.startIndex), "$");
            });
        }
    });
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map