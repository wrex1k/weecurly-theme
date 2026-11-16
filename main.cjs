const fs = require("fs");
const path = require("path");
const { Registry, parseRawGrammar } = require("vscode-textmate");
const oniguruma = require("vscode-oniguruma");

// Ignored scopes (languages not commonly used in your snippets)
const ignoredScopes = [
  "source.regexp.python",
  "source.glsl",
  "source.asm",
  "source.x86",
  "source.x86_64",
  "source.arm",
  "source.cpp.embedded.macro",
  "source.js.jquery",
  "source.lua",
  "text.xml",
];

// Initialize oniguruma
let vscodeOnigurumaLib;
async function initializeOniguruma() {
  try {
    const wasmPath = path.join(
      __dirname,
      "node_modules",
      "vscode-oniguruma",
      "release",
      "onig.wasm",
    );
    if (!fs.existsSync(wasmPath)) {
      throw new Error(
        `onig.wasm not found at ${wasmPath}. Run 'npm install vscode-oniguruma'.`,
      );
    }
    const wasmBin = fs.readFileSync(wasmPath);
    await oniguruma.loadWASM(wasmBin);
    return {
      createOnigScanner(patterns) {
        return new oniguruma.OnigScanner(patterns);
      },
      createOnigString(s) {
        return new oniguruma.OnigString(s);
      },
    };
  } catch (err) {
    console.error(`❌ Failed to initialize oniguruma: ${err.message}`);
    console.error(
      "Ensure 'vscode-oniguruma' is installed and onig.wasm is present.",
    );
    process.exit(1);
  }
}

// Color palettes
const colorPalettes = {
  punchy: {
    variables: "#ff6188",
    functions: "#389dd9",
    keywords: "#ab9df2",
    strings: "#a9dc76",
    numbers: "#fc9867",
    comments: "#1bc79e",
    types: "#ffd866",
    constants: "#ffd866",
    operators: "#78dce8",
    punctuation: "#78dce8",
    properties: "#ff6188",
    methods: "#389dd9",
    classes: "#ffd866",
    namespaces: "#ab9df2",
    imports: "#ab9df2",
    tags: "#ab9df2",
    attributes: "#ff6188",
    template: "#ab9df2",
    invalid: "#ff6188",
    h1: "#1bc79e",
    h2: "#179f85",
    h3: "#127e6a",
    h4: "#13b6c2",
    h5: "#ab9df2",
    h6: "#ff6188",
    // Comment tags (tagged comments like #?, #!, etc.)
    commentQuestion: "#4aa8ff", // #? question - blue
    commentAlert: "#ff5370", // #! alert/important - red
    commentInfo: "#9ece6a", // #. info/note - green
    commentHighlight: "#ffdd57", // #* highlight - yellow
    commentReference: "#b392f0", // #] reference - purple
    commentQuote: "#7dcfff", // #> quote/code ref - cyan
    commentCodeblock: "#e1107c", // #} code block part - pinky
    commentDeprecated: "#5c6370", // #- deprecated - gray

    // Python-specific colors
    pythonDocstring: "#ffffff", // """ """ docstrings - strong red

    // Dockerfile-specific colors
    dockerOperator: "#ff6188", // && pipes - red
    dockerContinuation: "#fc9867", // \ line continuation - orange
    dockerFlag: "#78dce8", // --flag names - cyan
    dockerFlagValue: "#a9dc76", // --flag=value - green
    dockerPathDepth1: "#1bc79e", // /var - teal bright
    dockerPathDepth2: "#179f85", // /www - teal medium
    dockerPathDepth3: "#127e6a", // /html - teal deep
    dockerPathDepth4: "#0e5e50", // deeper paths
    dockerPathDepth5: "#0a4f42", // deepest paths
    dockerPathSeparator: "#6f7a7a", // / separator - gray
    dockerImage: "#ffd866", // image name - yellow
    dockerImageTag: "#fc9867", // :8.2-fpm tag - orange
    dockerNumber: "#fc9867", // port numbers - orange
    dockerBracket: "#78dce8", // [] brackets - cyan
    dockerRelPath: "#a9dc76", // ./ relative path - green
  },
  pastel: {
    variables: "#f68ea8",
    functions: "#65a8d0",
    keywords: "#cac2f1",
    strings: "#bbd99d",
    numbers: "#f4b393",
    comments: "#37cfab",
    types: "#f6dd93",
    constants: "#f6dd93",
    operators: "#a0dde4",
    punctuation: "#a0dde4",
    properties: "#f68ea8",
    methods: "#65a8d0",
    classes: "#f6dd93",
    namespaces: "#cac2f1",
    imports: "#cac2f1",
    tags: "#cac2f1",
    attributes: "#f68ea8",
    template: "#cac2f1",
    invalid: "#f68ea8",
    h1: "#37cfab",
    h2: "#2ea790",
    h3: "#248772",
    h4: "#4ad1e0",
    h5: "#cac2f1",
    h6: "#f68ea8",
    // Comment tags (tagged comments like #?, #!, etc.)
    commentQuestion: "#4aa8ff", // #? question - blue
    commentAlert: "#ff5370", // #! alert/important - red
    commentInfo: "#9ece6a", // #. info/note - green
    commentHighlight: "#ffdd57", // #* highlight - yellow
    commentReference: "#b392f0", // #] reference - purple
    commentQuote: "#7dcfff", // #> quote/code ref - cyan
    commentCodeblock: "#e1107c", // #} code block part - pinky
    commentDeprecated: "#5c6370", // #- deprecated - gray

    // Python-specific colors
    pythonDocstring: "#e88388", // """ """ docstrings - pastel red

    // Dockerfile-specific colors
    dockerOperator: "#f68ea8", // && pipes - pink/red
    dockerContinuation: "#f4b393", // \ line continuation - orange
    dockerFlag: "#a0dde4", // --flag names - cyan
    dockerFlagValue: "#bbd99d", // --flag=value - green
    dockerPathDepth1: "#37cfab", // /var - teal bright
    dockerPathDepth2: "#2ea790", // /www - teal medium
    dockerPathDepth3: "#248772", // /html - teal deep
    dockerPathDepth4: "#1b6957", // deeper paths
    dockerPathDepth5: "#155a49", // deepest paths
    dockerPathSeparator: "#7d8a8a", // / separator - gray
    dockerImage: "#f6dd93", // image name - yellow
    dockerImageTag: "#f4b393", // :8.2-fpm tag - orange
    dockerNumber: "#f4b393", // port numbers - orange
    dockerBracket: "#a0dde4", // [] brackets - cyan
    dockerRelPath: "#bbd99d", // ./ relative path - green
  },
};

// UI colors
const uiColorsBase = {
  foreground: "#cccccc",
  descriptionForeground: "#a6b0b0",
  errorForeground: "#d76c73",
  focusBorder: "#6e7681",
  "sash.hoverBorder": "#6e7681",
  "icon.foreground": "#c8d0d0",
  "editor.background": "#0d1117",
  "editor.foreground": "#e6edf3",
  "editor.lineHighlightBackground": "#161b22",
  "editor.lineHighlightBorder": "#21262d",
  "editor.findMatchBackground": "#6e768155",
  "editor.findMatchHighlightBackground": "#6e768133",
  "editor.wordHighlightBackground": "#6e768122",
  "editor.wordHighlightStrongBackground": "#6e768133",
  "editor.selectionBackground": "#264f78",
  "editor.selectionForeground": "#e6edf3",
  "editor.selectionHighlightBackground": "#6e768126",
  "editor.inactiveSelectionBackground": "#264f7880",
  "editorCursor.foreground": "#a5a5a5",
  "editorBracketMatch.background": "#6e768122",
  "editorBracketMatch.border": "#6e7681",
  "editorHoverWidget.background": "#161b22",
  "editorHoverWidget.border": "#30363d",
  "editorSuggestWidget.background": "#161b22",
  "editorSuggestWidget.border": "#30363d",
  "editorSuggestWidget.foreground": "#c9d1d9",
  "editorSuggestWidget.selectedBackground": "#21262d",
  "editorWidget.background": "#161b22",
  "editorWidget.border": "#30363d",
  "editorGutter.background": "#0d1117",
  "editorGutter.addedBackground": "#56d364",
  "editorGutter.deletedBackground": "#f85149",
  "editorGutter.modifiedBackground": "#6e7681",
  "editorLineNumber.foreground": "#6e7681",
  "editorLineNumber.activeForeground": "#c9d1d9",
  "editorIndentGuide.background1": "#21262d",
  "editorIndentGuide.activeBackground1": "#30363d",
  "editorRuler.foreground": "#ea0f0f",
  "editorStickyScroll.background": "#0d1117",
  "editorStickyScrollHover.background": "#161b22",
  "editorOverviewRuler.border": "#0d1117",
  "diffEditor.insertedTextBackground": "#23863a33",
  "diffEditor.removedTextBackground": "#da363333",
  "diffEditor.diagonalFill": "#21262d",
  "activityBar.background": "#010409",
  "activityBar.foreground": "#e6edf3",
  "activityBar.border": "#21262d",
  "activityBar.activeBorder": "#6e7681",
  "activityBar.inactiveForeground": "#7d8590",
  "activityBarBadge.background": "#6e7681",
  "activityBarBadge.foreground": "#ffffff",
  "sideBar.background": "#010409",
  "sideBar.border": "#21262d",
  "sideBarSectionHeader.background": "#010409",
  "titleBar.activeBackground": "#010409",
  "titleBar.activeForeground": "#e6edf3",
  "titleBar.inactiveBackground": "#010409",
  "titleBar.inactiveForeground": "#7d8590",
  "titleBar.border": "#21262d",
  "statusBar.background": "#010409",
  "statusBar.foreground": "#e6edf3",
  "statusBar.border": "#21262d",
  "statusBar.noFolderBackground": "#010409",
  "statusBar.debuggingBackground": "#6e7681",
  "statusBar.debuggingForeground": "#e6edf3",
  "statusBarItem.remoteBackground": "#6e7681",
  "statusBarItem.remoteForeground": "#ffffff",
  "statusBarItem.hoverBackground": "#21262d",
  "panel.background": "#010409",
  "panel.border": "#21262d",
  "panelTitle.activeForeground": "#e6edf3",
  "panelTitle.inactiveForeground": "#7d8590",
  "panelTitle.activeBorder": "#6e7681",
  "tab.border": "#21262d",
  "tab.activeBackground": "#0d1117",
  "tab.activeForeground": "#ffffff",
  "tab.activeBorder": "#0d1117",
  "tab.activeBorderTop": "#6e7681",
  "tab.inactiveBackground": "#010409",
  "tab.inactiveForeground": "#7d8590",
  "tab.hoverBackground": "#161b22",
  "tab.unfocusedActiveBorderTop": "#30363d",
  "tab.lastPinnedBorder": "#6e768133",
  "breadcrumb.foreground": "#7d8590",
  "breadcrumb.focusForeground": "#e6edf3",
  "breadcrumb.activeSelectionForeground": "#e6edf3",
  "breadcrumb.background": "#0d1117",
  "breadcrumbPicker.background": "#161b22",
  "menu.background": "#161b22",
  "menu.foreground": "#c9d1d9",
  "menu.border": "#30363d",
  "menu.selectionBackground": "#21262d",
  "menu.selectionForeground": "#e6edf3",
  "menu.separatorBackground": "#30363d",
  "button.background": "#6e7681",
  "button.foreground": "#ffffff",
  "button.hoverBackground": "#5a6269",
  "button.border": "#ffffff12",
  "button.secondaryBackground": "#21262d",
  "button.secondaryForeground": "#c9d1d9",
  "button.secondaryHoverBackground": "#30363d",
  "dropdown.background": "#161b22",
  "dropdown.border": "#30363d",
  "dropdown.foreground": "#c9d1d9",
  "dropdown.listBackground": "#0d1117",
  "checkbox.background": "#161b22",
  "checkbox.border": "#30363d",
  "radio.activeBorder": "#6e7681",
  "radio.activeForeground": "#ffffff",
  "radio.activeBackground": "#6e768182",
  "radio.inactiveBorder": "#30363d",
  "input.background": "#0d1117",
  "input.foreground": "#e6edf3",
  "input.border": "#30363d",
  "input.placeholderForeground": "#7d8590",
  "inputOption.activeBorder": "#6e7681",
  "inputOption.activeBackground": "#6e768155",
  "inputOption.activeForeground": "#ffffff",
  "keybindingLabel.foreground": "#c9d1d9",
  "list.dropBackground": "#21262d",
  "list.focusOutline": "#6e7681",
  "list.focusHighlightForeground": "#6e7681",
  "list.highlightForeground": "#6e7681",
  "list.hoverBackground": "#161b22",
  "list.activeSelectionBackground": "#21262d",
  "list.activeSelectionForeground": "#e6edf3",
  "list.inactiveSelectionBackground": "#21262d",
  "list.deemphasizedForeground": "#7d8590",
  "notificationCenterHeader.background": "#161b22",
  "notificationCenterHeader.foreground": "#c9d1d9",
  "notifications.background": "#161b22",
  "notifications.border": "#30363d",
  "notifications.foreground": "#c9d1d9",
  "notificationLink.foreground": "#6e7681",
  "quickInput.background": "#161b22",
  "quickInput.foreground": "#c9d1d9",
  "badge.background": "#30363d",
  "badge.foreground": "#e6edf3",
  "progressBar.background": "#6e7681",
  "peekView.border": "#6e7681",
  "peekViewTitle.background": "#161b22",
  "peekViewTitleLabel.foreground": "#e6edf3",
  "peekViewTitleDescription.foreground": "#7d8590",
  "peekViewEditor.background": "#0d1117",
  "peekViewEditor.matchHighlightBackground": "#6e768144",
  "peekViewResult.background": "#161b22",
  "peekViewResult.matchHighlightBackground": "#6e768144",
  "terminal.foreground": "#e6edf3",
  "terminal.selectionBackground": "#264f78",
  "terminal.inactiveSelectionBackground": "#264f7880",
  "terminalCursor.foreground": "#a5a5a5",
  "terminal.tab.activeBorder": "#6e7681",
  "terminal.border": "#21262d",
  "editorGroup.border": "#21262d",
  "editorGroupHeader.tabsBackground": "#010409",
  "editorGroupHeader.tabsBorder": "#21262d",
  "scrollbar.shadow": "#000000",
  "scrollbarSlider.background": "#6e768144",
  "scrollbarSlider.hoverBackground": "#6e768177",
  "scrollbarSlider.activeBackground": "#c9d1d955",
  "minimapSlider.background": "#6e768144",
  "minimapSlider.hoverBackground": "#6e768177",
  "minimapSlider.activeBackground": "#c9d1d955",
  "textBlockQuote.background": "#161b22",
  "textBlockQuote.border": "#30363d",
  "textCodeBlock.background": "#161b22",
  "textLink.foreground": "#6e7681",
  "textLink.activeForeground": "#8b949e",
  "textPreformat.background": "#21262d",
  "textPreformat.foreground": "#e6edf3",
  "widget.border": "#30363d",
  "widget.shadow": "#0000005c",
  "gitDecoration.addedResourceForeground": "#56d364",
  "gitDecoration.modifiedResourceForeground": "#d29922",
  "gitDecoration.deletedResourceForeground": "#f85149",
  "gitDecoration.untrackedResourceForeground": "#6e7681",
  "gitDecoration.ignoredResourceForeground": "#484f58",
  "selection.background": "#264f78",
  "terminal.ansiBlack": "#0d1117",
  "terminal.ansiRed": "#ff6188",
  "terminal.ansiGreen": "#a9dc76",
  "terminal.ansiYellow": "#ffd866",
  "terminal.ansiBlue": "#389dd9",
  "terminal.ansiMagenta": "#ab9df2",
  "terminal.ansiCyan": "#78dce8",
  "terminal.ansiWhite": "#e6edf3",
  "terminal.ansiBrightBlack": "#484f58",
  "terminal.ansiBrightRed": "#ff7a9d",
  "terminal.ansiBrightGreen": "#b8e48f",
  "terminal.ansiBrightYellow": "#ffe38f",
  "terminal.ansiBrightBlue": "#58b4eb",
  "terminal.ansiBrightMagenta": "#bfb1f7",
  "terminal.ansiBrightCyan": "#8ee7ef",
  "terminal.ansiBrightWhite": "#ffffff",
};

// Funkcia na generovanie semantic token colors
function generateSemanticTokenColors(colorPalette) {
  return {
    // Základné komentáre
    comment: {
      foreground: colorPalette.comments,
      fontStyle: "italic",
    },
    "comment.block": {
      foreground: colorPalette.comments,
      fontStyle: "italic",
    },
    "comment.line": {
      foreground: colorPalette.comments,
      fontStyle: "italic",
    },
    "comment.documentation": {
      foreground: colorPalette.comments,
      fontStyle: "italic",
    },
    // Language-specific komentáre
    "comment:csharp": {
      foreground: colorPalette.comments,
      fontStyle: "italic",
    },
    "comment.block:csharp": {
      foreground: colorPalette.comments,
      fontStyle: "italic",
    },
    "comment.line:csharp": {
      foreground: colorPalette.comments,
      fontStyle: "italic",
    },
    "comment.documentation:csharp": {
      foreground: colorPalette.comments,
      fontStyle: "italic",
    },
    // Premenné - jednotná farba
    variable: colorPalette.variables,
    "variable.readonly": colorPalette.variables,
    "variable.parameter": colorPalette.variables,
    "variable.local": colorPalette.variables,
    "variable.property": colorPalette.properties,
    // Ostatné semantic tokeny
    function: colorPalette.functions,
    method: colorPalette.methods,
    "function.static": colorPalette.functions,
    "method.static": colorPalette.methods,
    class: colorPalette.classes,
    struct: colorPalette.types,
    interface: colorPalette.types,
    enum: colorPalette.types,
    type: colorPalette.types,
    typeParameter: colorPalette.types,
    keyword: colorPalette.keywords,
    "keyword.control": colorPalette.keywords,
    string: colorPalette.strings,
    "string.escape": colorPalette.strings,
    number: colorPalette.numbers,
    boolean: colorPalette.constants,
    operator: colorPalette.operators,
    namespace: colorPalette.namespaces,
    property: colorPalette.properties,
    "property.static": colorPalette.properties,
    enumMember: colorPalette.constants,
    event: colorPalette.variables,
    macro: colorPalette.keywords,
    label: colorPalette.keywords,
  };
}

// Enhanced scope-to-color mapping
function getScopeColorMap(colorPalette) {
  return {
    // Comments - unified styling
    comment: colorPalette.comments,
    "comment.line": colorPalette.comments,
    "comment.block": colorPalette.comments,
    "comment.documentation": colorPalette.comments,
    "comment.line.double-slash": colorPalette.comments,
    "comment.line.number-sign": colorPalette.comments,
    "comment.line.asterisk": colorPalette.comments,
    "comment.line.percentage": colorPalette.comments,
    "punctuation.definition.comment": colorPalette.comments,
    "meta.comment": colorPalette.comments,

    // Variables - unified styling
    variable: colorPalette.variables,
    "variable.other": colorPalette.variables,
    "variable.other.readwrite": colorPalette.variables,
    "variable.other.constant": colorPalette.variables,
    "variable.other.object": colorPalette.variables,
    "variable.other.member": colorPalette.variables,
    "variable.parameter": colorPalette.variables,
    "variable.parameter.function": colorPalette.variables,
    "variable.language": colorPalette.variables,
    "variable.function": colorPalette.variables,
    "support.variable": colorPalette.variables,
    "support.variable.property": colorPalette.variables,
    "support.variable.function": colorPalette.variables,
    "entity.name.variable": colorPalette.variables,
    "meta.definition.variable.name": colorPalette.variables,
    "punctuation.definition.variable": colorPalette.variables,
    "string.unquoted.environment-variable": colorPalette.variables,
    "string.unquoted.environment-variable.shell": colorPalette.variables,
    "string.interpolated.makefile": colorPalette.variables,
    "variable.other.makefile": colorPalette.variables,
    "variable.language.makefile": colorPalette.variables,
    // Ostatné scopes
    "variable.other.property": colorPalette.properties,
    "meta.object-literal.key": colorPalette.properties,
    "support.type.property-name": colorPalette.properties,
    "entity.name.function": colorPalette.functions,
    "entity.name.method": colorPalette.methods,
    "support.function": colorPalette.functions,
    "support.function.any-method": colorPalette.methods,
    "meta.function-call": colorPalette.functions,
    "meta.method-call": colorPalette.methods,
    keyword: colorPalette.keywords,
    "keyword.control": colorPalette.keywords,
    "keyword.operator": colorPalette.operators,
    "keyword.operator.logical": colorPalette.operators,
    "keyword.operator.arithmetic": colorPalette.operators,
    "keyword.operator.ternary": colorPalette.operators,
    "keyword.other": colorPalette.keywords,
    "storage.type": colorPalette.keywords,
    "storage.modifier": colorPalette.keywords,
    storage: colorPalette.keywords,
    string: colorPalette.strings,
    "string.quoted": colorPalette.strings,
    "string.unquoted": colorPalette.strings,
    "string.template": colorPalette.strings,
    "string.interpolated": colorPalette.strings,
    "constant.numeric": colorPalette.numbers,
    "keyword.other.unit": colorPalette.numbers,
    "constant.language": colorPalette.constants,
    "constant.character": colorPalette.constants,
    "constant.other": colorPalette.constants,
    comment: colorPalette.comments,
    "comment.block": colorPalette.comments,
    "comment.line": colorPalette.comments,
    "punctuation.definition.comment": colorPalette.comments,
    "comment.block.java": colorPalette.comments,
    "punctuation.definition.comment.java": colorPalette.comments,
    "string.quoted.docstring.multi.python": colorPalette.pythonDocstring,
    "entity.name.type": colorPalette.types,
    "entity.name.class": colorPalette.classes,
    "support.type": colorPalette.types,
    "support.class": colorPalette.classes,
    "entity.other.inherited-class": colorPalette.classes,
    "variable.other.enummember": colorPalette.constants,
    "entity.other.attribute-name": colorPalette.attributes,
    "entity.other.attribute-name.id": colorPalette.attributes,
    "entity.other.attribute-name.class": colorPalette.attributes,
    "entity.other.attribute-name.pseudo-class": colorPalette.attributes,
    "entity.other.attribute-name.pseudo-element": colorPalette.attributes,
    "punctuation.accessor": colorPalette.operators,
    "support.function.builtin": colorPalette.operators,
    "support.constant.math": colorPalette.operators,
    punctuation: colorPalette.punctuation,
    "meta.brace": colorPalette.punctuation,
    "meta.bracket": colorPalette.punctuation,
    "entity.name.tag": colorPalette.tags,
    "punctuation.section.embedded.begin": colorPalette.tags,
    "punctuation.section.embedded.end": colorPalette.tags,
    "punctuation.definition.template-expression.begin": colorPalette.template,
    "punctuation.definition.template-expression.end": colorPalette.template,
    "punctuation.section.embedded": colorPalette.template,
    "meta.template.expression": colorPalette.template,
    invalid: colorPalette.invalid,
    "invalid.illegal": colorPalette.invalid,
    "keyword.control.import": colorPalette.imports,
    "entity.name.namespace": colorPalette.namespaces,
    "entity.name.section": colorPalette.keywords,
    // Markdown heading levels (VS Code expects markup.heading.h1-h6.markdown for each level)
    "markup.heading.h1.markdown": colorPalette.h1,
    "markup.heading.h2.markdown": colorPalette.h2,
    "markup.heading.h3.markdown": colorPalette.h3,
    "markup.heading.h4.markdown": colorPalette.h4,
    "markup.heading.h5.markdown": colorPalette.h5,
    "markup.heading.h6.markdown": colorPalette.h6,
    // fallback for generic heading
    "markup.heading.markdown": colorPalette.h2,
    // C++ specific scopes
    "entity.name.scope-resolution": colorPalette.namespaces,
    "entity.name.scope-resolution.function.definition": colorPalette.functions,
    "entity.name.operator.custom-literal": colorPalette.operators,
    // Kotlin specific scopes
    "entity.name.package": colorPalette.namespaces,
    // Go specific scopes
    "entity.name.import": colorPalette.imports,
    // TypeScript specific scopes
    "new.expr": colorPalette.keywords,
    "cast.expr": colorPalette.keywords,
    "entity.name.label": colorPalette.keywords,
    // Markdown heading levels - grammar produces heading.X.markdown scopes
    "heading.1.markdown": colorPalette.h1,
    "heading.2.markdown": colorPalette.h2,
    "heading.3.markdown": colorPalette.h3,
    "heading.4.markdown": colorPalette.h4,
    "heading.5.markdown": colorPalette.h5,
    "heading.6.markdown": colorPalette.h6,
    // Markdown specific scopes
    // (handled above for .markdown)
    "markup.italic": colorPalette.comments,
    "markup.bold": colorPalette.keywords,
    "markup.strikethrough": colorPalette.comments,
    "markup.quote": colorPalette.comments,
    "markup.list.numbered": colorPalette.operators,
    "markup.list.unnumbered": colorPalette.operators,
    "markup.fenced_code.block": colorPalette.strings,
    "fenced_code.block.language": colorPalette.keywords,
    "markup.table": colorPalette.operators,
    // Additional scopes to reduce unprocessed scopes
    meta: colorPalette.operators,
    "meta.embedded": colorPalette.operators,
    source: colorPalette.operators,
    support: colorPalette.types,
    "meta.tag": colorPalette.tags,
    "meta.attribute": colorPalette.attributes,
    "meta.definition": colorPalette.variables,
    "meta.function": colorPalette.functions,
    "meta.class": colorPalette.classes,
    "meta.method": colorPalette.methods,
    "meta.property": colorPalette.properties,
    "meta.namespace": colorPalette.namespaces,
    "meta.import": colorPalette.imports,
    "meta.annotation": colorPalette.keywords,
    "meta.decorator": colorPalette.keywords,
    "meta.regex": colorPalette.strings,
    "string.regexp": colorPalette.strings,
    "constant.character.escape": colorPalette.strings,
    "punctuation.definition.string": colorPalette.punctuation,
    "punctuation.definition": colorPalette.punctuation,
    "punctuation.separator": colorPalette.punctuation,
    "punctuation.terminator": colorPalette.punctuation,
    "meta.block": colorPalette.punctuation,
    "meta.group": colorPalette.punctuation,
  };
}

// Language-specific rules (only truly language-specific overrides)
function getLanguageSpecificRules(colorPalette) {
  // Common patterns that apply to all languages for complete consistency
  const commonRules = {
    // Source and meta
    source: colorPalette.operators,
    meta: colorPalette.operators,

    // Variables
    variable: colorPalette.variables,
    "variable.parameter": colorPalette.variables,
    "variable.other": colorPalette.variables,
    "variable.language": colorPalette.variables,
    "meta.definition.variable": colorPalette.variables,
    "entity.name.variable": colorPalette.variables,

    // Functions and methods
    function: colorPalette.functions,
    "entity.name.function": colorPalette.functions,
    "meta.function": colorPalette.functions,
    "meta.method": colorPalette.functions,
    "meta.function-call": colorPalette.functions,
    "support.function": colorPalette.functions,

    // Classes and types
    class: colorPalette.classes,
    "meta.class": colorPalette.classes,
    "entity.name.type.class": colorPalette.classes,
    "entity.name.type": colorPalette.types,
    "storage.type": colorPalette.types,
    "support.type": colorPalette.types,
    "support.class": colorPalette.classes,

    // Keywords and storage
    keyword: colorPalette.keywords,
    "storage.modifier": colorPalette.keywords,
    "keyword.control": colorPalette.keywords,
    "keyword.operator": colorPalette.operators,

    // Properties
    property: colorPalette.properties,
    "variable.other.property": colorPalette.properties,
    "meta.object-literal.key": colorPalette.properties,
    "support.type.property-name": colorPalette.properties,

    // Constants
    constant: colorPalette.constants,
    "variable.other.constant": colorPalette.constants,
    "support.constant": colorPalette.constants,

    // Namespaces
    namespace: colorPalette.namespaces,
    "entity.name.namespace": colorPalette.namespaces,

    // Tags and attributes (for markup languages)
    "entity.name.tag": colorPalette.tags,
    "entity.other.attribute-name": colorPalette.attributes,

    // Punctuation
    punctuation: colorPalette.punctuation,
    "meta.brace": colorPalette.punctuation,
    "meta.bracket": colorPalette.punctuation,

    // Comments (all types)
    comment: {
      foreground: colorPalette.comments,
      fontStyle: "italic",
    },

    // Strings
    string: colorPalette.strings,
    "string.quoted": colorPalette.strings,
    "string.template": colorPalette.strings,

    // Numbers
    "constant.numeric": colorPalette.numbers,
  };

  return {
    // Only include truly unique language-specific rules here
    java: {
      ...commonRules,
      "storage.type.generic.java": colorPalette.types,
      "storage.modifier.java": colorPalette.keywords,
    },
    shellscript: {
      ...commonRules,
      "meta.statement.shell": colorPalette.keywords,
      "meta.scope.if-block.shell": colorPalette.keywords,
      "meta.statement.command.shell": colorPalette.functions,
    },
    kotlin: {
      ...commonRules,
      "entity.name.function.kotlin": colorPalette.functions,
      "keyword.control.kotlin": colorPalette.keywords,
    },
    python: {
      ...commonRules,
      "string.quoted.docstring.multi.python": colorPalette.pythonDocstring,
      "punctuation.definition.string.begin.python": colorPalette.strings,
      "punctuation.definition.string.end.python": colorPalette.strings,
    },
    markdown: {
      ...commonRules,
      // Markdown-specific heading styles using h1-h6
      h1: colorPalette.h1,
      h2: colorPalette.h2,
      h3: colorPalette.h3,
      h4: colorPalette.h4,
      h5: colorPalette.h5,
      h6: colorPalette.h6,
      // Optionally, map markup.heading.h1-h6 if present in grammar
      "markup.heading.h1.markdown": colorPalette.h1,
      "markup.heading.h2.markdown": colorPalette.h2,
      "markup.heading.h3.markdown": colorPalette.h3,
      "markup.heading.h4.markdown": colorPalette.h4,
      "markup.heading.h5.markdown": colorPalette.h5,
      "markup.heading.h6.markdown": colorPalette.h6,
      // Other markdown-specific rules
      "meta.link.inline.markdown": colorPalette.strings,
      "meta.image.inline.markdown": colorPalette.strings,
      "markup.bold.markdown": colorPalette.keywords,
      "markup.italic.markdown": colorPalette.comments,
      "markup.quote.markdown": colorPalette.comments,
      "markup.fenced_code.block.markdown": colorPalette.strings,
      "fenced_code.block.language.markdown": colorPalette.keywords,
    },
    make: {
      ...commonRules,
      "meta.scope.target.makefile": colorPalette.functions,
      "entity.name.function.target.makefile": colorPalette.functions,
      "support.function.target.PHONY.makefile": colorPalette.keywords,
    },
    css: {
      ...commonRules,
      "entity.name.tag.css": colorPalette.tags,
      "entity.other.attribute-name.class.css": colorPalette.attributes,
      "entity.other.attribute-name.id.css": colorPalette.attributes,
      "support.type.property-name.css": colorPalette.properties,
      "meta.selector.css": colorPalette.tags,
      "meta.property-name.css": colorPalette.properties,
      "meta.property-value.css": colorPalette.strings,
    },
    scss: {
      ...commonRules,
      "entity.name.tag.scss": colorPalette.tags,
      "entity.other.attribute-name.class.scss": colorPalette.attributes,
      "entity.other.attribute-name.id.scss": colorPalette.attributes,
      "support.type.property-name.scss": colorPalette.properties,
      "variable.scss": colorPalette.variables,
    },
    yaml: {
      ...commonRules,
      "entity.name.tag.yaml": colorPalette.tags,
      "keyword.other.definition.yaml": colorPalette.keywords,
    },
    csharp: {
      ...commonRules,
      "entity.name.type.cs": colorPalette.types,
      "entity.name.class.cs": colorPalette.classes,
      "entity.name.method.cs": colorPalette.functions,
      "storage.type.cs": colorPalette.types,
      "storage.modifier.cs": colorPalette.keywords,
    },
    go: {
      ...commonRules,
      "entity.name.type.go": colorPalette.types,
      "entity.name.function.go": colorPalette.functions,
      "storage.type.go": colorPalette.types,
      "storage.modifier.go": colorPalette.keywords,
      "entity.name.import.go": colorPalette.imports,
    },
    docker: {
      ...commonRules,
      "keyword.other.special-method.dockerfile": colorPalette.keywords,
      // Dockerfile injection grammar scopes
      "keyword.operator.logical.dockerfile": colorPalette.dockerOperator,
      "keyword.operator.pipe.dockerfile": colorPalette.dockerOperator,
      "keyword.operator.semicolon.dockerfile": colorPalette.dockerOperator,
      "punctuation.separator.continuation.dockerfile":
        colorPalette.dockerContinuation,
      "punctuation.definition.flag.dockerfile": colorPalette.dockerFlag,
      "variable.parameter.flag.dockerfile": colorPalette.dockerFlag,
      "keyword.operator.assignment.dockerfile": colorPalette.dockerOperator,
      "string.unquoted.flag-value.dockerfile": colorPalette.dockerFlagValue,
      "variable.other.environment.dockerfile": colorPalette.variables,
      "punctuation.separator.path.dockerfile.depth1":
        colorPalette.dockerPathSeparator,
      "entity.name.path.segment.dockerfile.depth1":
        colorPalette.dockerPathDepth1,
      "punctuation.separator.path.dockerfile.depth2":
        colorPalette.dockerPathSeparator,
      "entity.name.path.segment.dockerfile.depth2":
        colorPalette.dockerPathDepth2,
      "punctuation.separator.path.dockerfile.depth3":
        colorPalette.dockerPathSeparator,
      "entity.name.path.segment.dockerfile.depth3":
        colorPalette.dockerPathDepth3,
      "punctuation.separator.path.dockerfile.depth4":
        colorPalette.dockerPathSeparator,
      "entity.name.path.segment.dockerfile.depth4":
        colorPalette.dockerPathDepth4,
      "punctuation.separator.path.dockerfile.depth5":
        colorPalette.dockerPathSeparator,
      "entity.name.path.segment.dockerfile.depth5":
        colorPalette.dockerPathDepth5,
      "entity.name.path.relative.dockerfile": colorPalette.dockerRelPath,
      "entity.name.image.dockerfile": colorPalette.dockerImage,
      "punctuation.separator.tag.dockerfile": colorPalette.dockerPathSeparator,
      "constant.other.image-tag.dockerfile": colorPalette.dockerImageTag,
      "constant.numeric.port.dockerfile": colorPalette.dockerNumber,
      "punctuation.definition.array.dockerfile": colorPalette.dockerBracket,
    },
  };
}

const fileScopeMap = {
  ".cpp": "cpp",
  ".html": "html",
  ".java": "java",
  ".json": "json",
  ".py": "python",
  ".sh": "shellscript",
  ".ts": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".tsx": "typescript",
  ".cs": "csharp",
  ".go": "go",
  ".rs": "rust",
  ".php": "php",
  ".rb": "ruby",
  ".swift": "swift",
  ".kt": "kotlin",
  ".sql": "sql",
  ".ps1": "powershell",
  ".toml": "toml",
  ".xml": "xml",
  ".dockerfile": "docker",
  Dockerfile: "docker",
  dockerfile: "docker",
  ".css": "css",
  ".scss": "scss",
  ".yml": "yaml",
  ".yaml": "yaml",
  Makefile: "make",
  makefile: "make",
  ".mk": "make",
  ".md": "markdown",
};

async function analyzeScopes() {
  const registry = new Registry({
    onigLib: await initializeOniguruma(),
    loadGrammar: async (scopeName) => {
      if (ignoredScopes.includes(scopeName)) {
        console.warn(`⚠️ Ignoring scope: ${scopeName}`);
        return null;
      }

      const grammarPaths = {
        "source.python": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "python.json",
        ),
        "source.html": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "html.json",
        ),
        "source.javascript": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "javascript.json",
        ),
        "source.cpp": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "cpp.json",
        ),
        "source.csharp": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "csharp.json",
        ),
        "source.go": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "go.json",
        ),
        "source.java": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "java.json",
        ),
        "source.json": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "json.json",
        ),
        "source.kotlin": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "kotlin.json",
        ),
        "source.php": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "php.json",
        ),
        "source.powershell": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "powershell.json",
        ),
        "source.ruby": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "ruby.json",
        ),
        "source.rust": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "rust.json",
        ),
        "source.shell": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "shellscript.json",
        ),
        "source.sql": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "sql.json",
        ),
        "source.swift": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "swift.json",
        ),
        "source.toml": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "toml.json",
        ),
        "source.typescript": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "typescript.json",
        ),
        "source.xml": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "xml.json",
        ),
        "source.docker": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "docker.json",
        ),
        "source.make": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "make.json",
        ),
        "source.markdown": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "markdown.json",
        ),
        "source.css": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "css.json",
        ),
        "source.scss": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "scss.json",
        ),
        "source.yaml": path.join(
          __dirname,
          "node_modules",
          "tm-grammars",
          "grammars",
          "yaml.json",
        ),
      };

      const grammarPath = grammarPaths[scopeName];
      if (!grammarPath) {
        console.warn(`⚠️ Grammar not found for scope: ${scopeName}`);
        return null;
      }

      try {
        const content = fs.readFileSync(grammarPath, "utf-8");
        const grammar = JSON.parse(content);
        return parseRawGrammar(
          JSON.stringify({
            ...grammar,
            scopeName: scopeName,
          }),
          grammarPath,
        );
      } catch (error) {
        console.error(
          `❌ Error loading grammar for ${scopeName}: ${error.message}`,
        );
        return null;
      }
    },
  });

  const snippetsDir = path.join(process.cwd(), "snippets");
  if (!fs.existsSync(snippetsDir)) {
    console.warn(`⚠️ Snippets directory not found, creating: ${snippetsDir}`);
    fs.mkdirSync(snippetsDir, { recursive: true });
  }

  const scopeUsage = new Map();

  let files;
  try {
    files = fs.readdirSync(snippetsDir);
  } catch (err) {
    console.error(`❌ Error reading directory ${snippetsDir}: ${err.message}`);
    return scopeUsage;
  }

  console.log("🔍 Analyzing scopes in files...");

  for (const file of files) {
    const filePath = path.join(snippetsDir, file);
    let content;
    try {
      content = fs.readFileSync(filePath, "utf8");
      if (!content.trim()) {
        console.warn(`⚠️ File is empty: ${file}`);
        continue;
      }
    } catch (err) {
      console.error(`❌ Error reading file ${file}: ${err.message}`);
      continue;
    }

    const fileNameLower = file.toLowerCase();
    const ext = path.extname(file).toLowerCase();
    const scopeName = fileScopeMap[ext] || fileScopeMap[fileNameLower];

    if (!scopeName) {
      console.warn(`⚠️ Skipped file with unknown scope: ${file}`);
      continue;
    }

    let grammar;
    try {
      grammar = await registry.loadGrammar(`source.${scopeName}`);
      if (!grammar) {
        console.warn(`⚠️ Grammar not found for scope: source.${scopeName}`);
        continue;
      }
    } catch (err) {
      console.error(
        `❌ Error loading grammar for source.${scopeName}: ${err.message}`,
      );
      continue;
    }

    console.log(`📄 Processing: ${file} (source.${scopeName})`);

    // Debug for markdown scopes
    if (scopeName === "markdown") {
      console.log(`🔍 DEBUG: Processing markdown file: ${file}`);
    }

    let ruleStack = null;
    const lines = content.split(/\r?\n/);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      try {
        const result = grammar.tokenizeLine(line, ruleStack);
        ruleStack = result.ruleStack;

        result.tokens.forEach((token) => {
          const text = line.slice(token.startIndex, token.endIndex).trim();
          if (text) {
            token.scopes.forEach((scope) => {
              // Debug for markdown scopes
              if (
                scopeName === "markdown" &&
                (scope.includes("heading") || scope.includes("markup"))
              ) {
                console.log(
                  `🔍 DEBUG: Markdown scope found: ${scope} -> "${text}"`,
                );
              }

              if (!scopeUsage.has(scope)) {
                scopeUsage.set(scope, {
                  count: 0,
                  examples: new Set(),
                  languages: new Set(),
                  files: new Set(),
                });
              }

              const entry = scopeUsage.get(scope);
              entry.count++;
              entry.examples.add(text);
              entry.languages.add(scopeName);
              entry.files.add(file);
            });
          }
        });
      } catch (err) {
        console.error(
          `❌ Error tokenizing ${file}:${lineIndex + 1}: ${err.message}`,
        );
      }
    }
  }

  return scopeUsage;
}

function generateThemeRules(scopeUsage, colorPalette) {
  const rules = [];
  const processedScopes = new Set();
  const scopeColorMap = getScopeColorMap(colorPalette);
  const languageSpecificRules = getLanguageSpecificRules(colorPalette);

  console.log("🎨 Generating theme rules...");

  // Apply language-specific rules first (highest priority)
  for (const [language, langRules] of Object.entries(languageSpecificRules)) {
    for (const [scope, color] of Object.entries(langRules)) {
      if (scopeUsage.has(scope)) {
        rules.push({
          name: `${language} - ${scope}`,
          scope: scope,
          settings: {
            foreground: color,
            fontStyle: scope.includes("comment") ? "italic" : undefined,
          },
        });
        processedScopes.add(scope);
        console.log(`✅ Mapped language-specific: ${scope} -> ${color}`);
      }
    }
  }

  // Apply generic scope mappings
  for (const [scopePattern, color] of Object.entries(scopeColorMap)) {
    const matchingScopes = Array.from(scopeUsage.keys()).filter(
      (scope) =>
        !processedScopes.has(scope) &&
        (scope.includes(scopePattern) || scope.startsWith(scopePattern)),
    );

    if (matchingScopes.length > 0) {
      matchingScopes.forEach((scope) => {
        rules.push({
          name: `${scopePattern} - ${scope}`,
          scope: scope,
          settings: {
            foreground: color,
            fontStyle: scope.includes("comment") ? "italic" : undefined,
          },
        });
        processedScopes.add(scope);
        console.log(`✅ Mapped: ${scope} -> ${color}`);
      });

      console.log(
        `✅ Mapped pattern: ${scopePattern} -> ${color} (${matchingScopes.length} scopes)`,
      );
    }
  }

  // Handle remaining scopes
  const remainingScopes = Array.from(scopeUsage.keys()).filter(
    (scope) => !processedScopes.has(scope),
  );

  console.log(`📊 ${remainingScopes.length} unprocessed scopes remaining`);

  remainingScopes.forEach((scope) => {
    let color = getPredictedColor(scope, colorPalette);
    let fontStyle = scope.includes("comment") ? "italic" : undefined;

    rules.push({
      name: `Auto-mapped: ${scope}`,
      scope: scope,
      settings: {
        foreground: color,
        fontStyle: fontStyle,
      },
    });
    processedScopes.add(scope);
  });

  // Add tagged comment rules (from injection grammar)
  // These scopes come from syntaxes/comment-tags.tmLanguage.json
  // They must be appended last so they override generic comment colors in VS Code
  const taggedCommentRules = [
    { tag: "question", prefix: "#?", color: colorPalette.commentQuestion },
    { tag: "alert", prefix: "#!", color: colorPalette.commentAlert },
    { tag: "info", prefix: "#.", color: colorPalette.commentInfo },
    { tag: "highlight", prefix: "#*", color: colorPalette.commentHighlight },
    { tag: "reference", prefix: "#]", color: colorPalette.commentReference },
    { tag: "quote", prefix: "#>", color: colorPalette.commentQuote },
    { tag: "coderef", prefix: "#}", color: colorPalette.commentCodeblock },
    {
      tag: "deprecated",
      prefix: "#-",
      color: colorPalette.commentDeprecated,
      fontStyle: "strikethrough italic",
    },
  ];

  for (const { tag, prefix, color, fontStyle } of taggedCommentRules) {
    rules.push({
      name: `Tagged comment ${prefix} (${tag})`,
      scope: [
        `comment.tag.${tag}`,
        `comment.tag.${tag}.text`,
        `punctuation.definition.comment.tag.${tag}`,
        `punctuation.tag.${tag}`,
      ],
      settings: {
        foreground: color,
        fontStyle: fontStyle || "italic",
      },
    });
    console.log(`✅ Tagged comment: ${prefix} (${tag}) -> ${color}`);
  }

  // Add Python docstring rules (must override default string colors)
  rules.push({
    name: "Python docstring",
    scope: "string.quoted.docstring.multi.python",
    settings: {
      foreground: colorPalette.pythonDocstring,
      fontStyle: "bold",
    },
  });
  rules.push({
    name: "Python docstring begin punctuation",
    scope:
      "string.quoted.docstring.multi.python punctuation.definition.string.begin.python",
    settings: {
      foreground: colorPalette.pythonDocstring,
      fontStyle: "bold",
    },
  });
  rules.push({
    name: "Python docstring end punctuation",
    scope:
      "string.quoted.docstring.multi.python punctuation.definition.string.end.python",
    settings: {
      foreground: colorPalette.pythonDocstring,
      fontStyle: "bold",
    },
  });
  console.log(`✅ Python docstring -> ${colorPalette.pythonDocstring}`);

  // Add Dockerfile injection grammar rules
  // These scopes come from syntaxes/dockerfile-enhanced.tmLanguage.json
  const dockerfileRules = [
    {
      scope: "keyword.operator.logical.dockerfile",
      color: colorPalette.dockerOperator,
      name: "Docker && operator",
    },
    {
      scope: "keyword.operator.pipe.dockerfile",
      color: colorPalette.dockerOperator,
      name: "Docker pipe operator",
    },
    {
      scope: "keyword.operator.semicolon.dockerfile",
      color: colorPalette.dockerOperator,
      name: "Docker semicolon",
    },
    {
      scope: "keyword.operator.assignment.dockerfile",
      color: colorPalette.dockerOperator,
      name: "Docker assignment",
    },
    {
      scope: "punctuation.separator.continuation.dockerfile",
      color: colorPalette.dockerContinuation,
      name: "Docker line continuation",
    },
    {
      scope: "punctuation.definition.flag.dockerfile",
      color: colorPalette.dockerFlag,
      name: "Docker flag prefix",
    },
    {
      scope: "variable.parameter.flag.dockerfile",
      color: colorPalette.dockerFlag,
      name: "Docker flag name",
    },
    {
      scope: "string.unquoted.flag-value.dockerfile",
      color: colorPalette.dockerFlagValue,
      name: "Docker flag value",
    },
    {
      scope: "variable.other.environment.dockerfile",
      color: colorPalette.variables,
      name: "Docker env variable",
    },
    {
      scope: "punctuation.separator.path.dockerfile.depth1",
      color: colorPalette.dockerPathSeparator,
      name: "Docker path sep 1",
    },
    {
      scope: "entity.name.path.segment.dockerfile.depth1",
      color: colorPalette.dockerPathDepth1,
      name: "Docker path depth 1",
    },
    {
      scope: "punctuation.separator.path.dockerfile.depth2",
      color: colorPalette.dockerPathSeparator,
      name: "Docker path sep 2",
    },
    {
      scope: "entity.name.path.segment.dockerfile.depth2",
      color: colorPalette.dockerPathDepth2,
      name: "Docker path depth 2",
    },
    {
      scope: "punctuation.separator.path.dockerfile.depth3",
      color: colorPalette.dockerPathSeparator,
      name: "Docker path sep 3",
    },
    {
      scope: "entity.name.path.segment.dockerfile.depth3",
      color: colorPalette.dockerPathDepth3,
      name: "Docker path depth 3",
    },
    {
      scope: "punctuation.separator.path.dockerfile.depth4",
      color: colorPalette.dockerPathSeparator,
      name: "Docker path sep 4",
    },
    {
      scope: "entity.name.path.segment.dockerfile.depth4",
      color: colorPalette.dockerPathDepth4,
      name: "Docker path depth 4",
    },
    {
      scope: "punctuation.separator.path.dockerfile.depth5",
      color: colorPalette.dockerPathSeparator,
      name: "Docker path sep 5",
    },
    {
      scope: "entity.name.path.segment.dockerfile.depth5",
      color: colorPalette.dockerPathDepth5,
      name: "Docker path depth 5",
    },
    {
      scope: "entity.name.path.relative.dockerfile",
      color: colorPalette.dockerRelPath,
      name: "Docker relative path",
    },
    {
      scope: "entity.name.image.dockerfile",
      color: colorPalette.dockerImage,
      name: "Docker image name",
    },
    {
      scope: "punctuation.separator.tag.dockerfile",
      color: colorPalette.dockerPathSeparator,
      name: "Docker image tag sep",
    },
    {
      scope: "constant.other.image-tag.dockerfile",
      color: colorPalette.dockerImageTag,
      name: "Docker image tag",
    },
    {
      scope: "constant.numeric.port.dockerfile",
      color: colorPalette.dockerNumber,
      name: "Docker port number",
    },
    {
      scope: "punctuation.definition.array.dockerfile",
      color: colorPalette.dockerBracket,
      name: "Docker array bracket",
    },
  ];

  for (const { scope, color, name } of dockerfileRules) {
    rules.push({
      name,
      scope,
      settings: { foreground: color },
    });
  }
  console.log(`✅ Added ${dockerfileRules.length} Dockerfile injection rules`);

  return rules;
}

function getPredictedColor(scope, colorPalette) {
  const scopeColorMap = getScopeColorMap(colorPalette);
  const languageSpecificRules = getLanguageSpecificRules(colorPalette);

  for (const [language, langRules] of Object.entries(languageSpecificRules)) {
    if (scope in langRules) {
      return langRules[scope];
    }
  }

  for (const [pattern, color] of Object.entries(scopeColorMap)) {
    if (scope.includes(pattern) || scope.startsWith(pattern)) {
      return color;
    }
  }

  // Enhanced fallback for common scope patterns
  if (scope.includes("string")) return colorPalette.strings;
  if (scope.includes("comment")) return colorPalette.comments;
  if (scope.includes("number") || scope.includes("numeric"))
    return colorPalette.numbers;
  if (scope.includes("keyword")) return colorPalette.keywords;
  if (scope.includes("function")) return colorPalette.functions;
  if (scope.includes("type") || scope.includes("class"))
    return colorPalette.types;
  if (scope.includes("variable")) return colorPalette.variables;
  if (scope.includes("meta")) return colorPalette.operators;
  if (scope.includes("support")) return colorPalette.types;
  if (scope.includes("punctuation")) return colorPalette.punctuation;
  if (scope.includes("constant")) return colorPalette.constants;
  if (scope.includes("entity")) return colorPalette.variables;
  if (scope.includes("tag")) return colorPalette.tags;
  if (scope.includes("attribute")) return colorPalette.attributes;

  return colorPalette.operators; // Default fallback
}

async function enhanceTheme(mode = "both") {
  console.log("🚀 Starting theme enhancement...\n");

  const scopeUsage = await analyzeScopes();
  console.log(`📈 Analyzed ${scopeUsage.size} unique scopes`);

  const outputDir = path.join(process.cwd(), "themes");
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${outputDir}`);
    }
  } catch (err) {
    console.error(`❌ Error creating directory ${outputDir}: ${err.message}`);
    return;
  }

  const modes = mode === "both" ? ["punchy", "pastel"] : [mode];

  for (const currentMode of modes) {
    console.log(`\n🎨 === Generating ${currentMode.toUpperCase()} mode ===`);

    const colorPalette = colorPalettes[currentMode];
    if (!colorPalette) {
      console.error(`❌ Unknown mode: ${currentMode}`);
      continue;
    }

    // Adjust UI colors for the current mode
    const uiColors = {
      ...uiColorsBase,
      "sideBar.foreground": currentMode === "pastel" ? "#a6b0b0" : "#b8c2c2",
      "sideBarSectionHeader.foreground":
        currentMode === "pastel" ? "#a6b0b0" : "#b8c2c2",
      "sideBarTitle.foreground":
        currentMode === "pastel" ? "#a6b0b0" : "#b8c2c2",
    };

    const baseThemeName = `weeCurly-theme-${currentMode}.json`;
    const themePath = path.join(outputDir, baseThemeName);
    let existingTheme = {};

    try {
      const themeContent = fs.readFileSync(themePath, "utf8");
      existingTheme = JSON.parse(themeContent);
      console.log(`📖 Loaded existing ${currentMode} theme`);
    } catch (err) {
      console.warn(`⚠️ ${currentMode} theme not found, creating new one`);
      existingTheme = {
        $schema: "vscode://schemas/color-theme",
        name: `WeeCurly ${
          currentMode.charAt(0).toUpperCase() + currentMode.slice(1)
        }`,
        type: "dark",
        semanticHighlighting: true,
        colors: uiColors,
        tokenColors: [],
      };
    }

    const newRules = generateThemeRules(scopeUsage, colorPalette);

    // Generovanie semantic token colors
    const semanticTokenColors = generateSemanticTokenColors(colorPalette);

    const enhancedTheme = {
      ...existingTheme,
      name: `WeeCurly ${
        currentMode.charAt(0).toUpperCase() + currentMode.slice(1)
      }`,
      semanticHighlighting: true,
      colors: uiColors,
      tokenColors: newRules,
      semanticTokenColors: semanticTokenColors,
    };

    const outputPath = path.join(outputDir, `weeCurly-${currentMode}.json`);
    try {
      fs.writeFileSync(outputPath, JSON.stringify(enhancedTheme, null, 2));
      console.log(`✅ ${currentMode} theme successfully generated!`);
      console.log(`📁 Output: ${outputPath}`);
      console.log(
        `🎨 Generated ${newRules.length} rules for consistent colors`,
      );
      console.log(
        `🔧 Added ${
          Object.keys(semanticTokenColors).length
        } semantic token rules`,
      );
    } catch (err) {
      console.error(`❌ Error saving theme ${outputPath}: ${err.message}`);
    }
  }

  console.log("\n🎉 Completed! Generated themes:");
  if (modes.includes("punchy")) console.log("  • themes/weeCurly-punchy.json");
  if (modes.includes("pastel")) console.log("  • themes/weeCurly-pastel.json");
}

const args = process.argv.slice(2);
const mode = args[0] || "both";
enhanceTheme(mode).catch((err) => {
  console.error(`❌ Critical error during theme generation: ${err.message}`);
  process.exit(1);
});
