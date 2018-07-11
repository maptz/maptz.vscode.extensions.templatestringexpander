# Template String Expander

A Visual Studio Code extension for converting `"string literals"` into `$"template strings"`. 

![String Literals](https://raw.githubusercontent.com/maptz/Maptz.VSCode.Extensions.templatestringexpander/master/imgs/CSharp_string_template.gif)

## Features

> The extension is currently experimental and of alpha quality. Please file bugs on the github repository.

This extension currently supports `CSharp`, `Javascript` and `Typescript` files. To use the extension, follow these instructions:

- Open a file in one of the supported languages and place your caret within a string literal.
- Open the command palette (Ctrl+Shift+P) and select the `Convert to Template String` command, or press the default key chord `ctrl+m ctrl+2`. 

For CSharp documents, a string like `"Some string"` will be converted to a template string `$"Some string"`. For Javascript and Typescript documents, a string literal `"Some string"` will be converted to a template string ``Some strign``.

The extension exposes the following command which can be run to convert the string. 

- `stringTemplateExpander.convertToTemplateString`

## Other Extensions

View other extensions from [Maptz](https://marketplace.visualstudio.com/publishers/maptz)


## Requirements

No requirements currently.

## Extension Settings

The extension doesn't expose any settings.

## Known Issues

No known issues to-date. Please file a bug on github here. 

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial alpha release of the extension.

