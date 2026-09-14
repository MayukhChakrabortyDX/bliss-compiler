// @bun
// ../../logger/logger.ts
var LogType;
((LogType2) => {
  LogType2[LogType2["Error"] = 0] = "Error";
  LogType2[LogType2["Warning"] = 1] = "Warning";
  LogType2[LogType2["Info"] = 2] = "Info";
})(LogType ||= {});
var logCount = {
  [0 /* Error */]: 0,
  [1 /* Warning */]: 0,
  [2 /* Info */]: 0
};
var RESET = "\x1B[0m";
var BOLD = "\x1B[1m";
var GRAY = "\x1B[90m";
var COLORS = {
  [0 /* Error */]: "\x1B[31m",
  [1 /* Warning */]: "\x1B[33m",
  [2 /* Info */]: "\x1B[36m"
};
function log({
  type,
  where,
  title,
  description,
  suggestion
}) {
  const count = ++logCount[type];
  const label = LogType[type].toUpperCase();
  const color = COLORS[type];
  console.log(`${color}${BOLD}(${count}) [${label}${RESET} : ${where}] ` + `${BOLD}${title}${RESET}`);
  if (description)
    console.log(`${GRAY}description:${RESET}
` + `  ${description}
`);
  if (suggestion)
    console.log(`${GRAY}suggestion:${RESET}
` + `  ${suggestion}`);
  console.log();
}

// ../../lexer/tokens.ts
class StringContainer {
  str;
  constructor(str) {
    this.str = str;
  }
  toJSON() {
    return "<str.ctr>";
  }
}

class StringSpan {
  startIndex;
  endIndex;
  str;
  constructor(startIndex, endIndex, str) {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.str = str;
  }
  resolve() {
    return this.str.str.substring(this.startIndex, this.endIndex + 1);
  }
}
var TokenType;
((TokenType2) => {
  TokenType2[TokenType2["K_Data"] = 0] = "K_Data";
  TokenType2[TokenType2["K_If"] = 1] = "K_If";
  TokenType2[TokenType2["K_Action"] = 2] = "K_Action";
  TokenType2[TokenType2["K_Bind"] = 3] = "K_Bind";
  TokenType2[TokenType2["K_Fx"] = 4] = "K_Fx";
  TokenType2[TokenType2["K_Import"] = 5] = "K_Import";
  TokenType2[TokenType2["K_Using"] = 6] = "K_Using";
  TokenType2[TokenType2["K_View"] = 7] = "K_View";
  TokenType2[TokenType2["K_Let"] = 8] = "K_Let";
  TokenType2[TokenType2["K_Unsafe"] = 9] = "K_Unsafe";
  TokenType2[TokenType2["K_As"] = 10] = "K_As";
  TokenType2[TokenType2["K_Return"] = 11] = "K_Return";
  TokenType2[TokenType2["K_Ptr"] = 12] = "K_Ptr";
  TokenType2[TokenType2["K_Set"] = 13] = "K_Set";
  TokenType2[TokenType2["K_Get"] = 14] = "K_Get";
  TokenType2[TokenType2["K_CSet"] = 15] = "K_CSet";
  TokenType2[TokenType2["K_CGet"] = 16] = "K_CGet";
  TokenType2[TokenType2["K_Else"] = 17] = "K_Else";
  TokenType2[TokenType2["K_Elif"] = 18] = "K_Elif";
  TokenType2[TokenType2["K_Loop"] = 19] = "K_Loop";
  TokenType2[TokenType2["K_Break"] = 20] = "K_Break";
  TokenType2[TokenType2["K_Continue"] = 21] = "K_Continue";
  TokenType2[TokenType2["K_With"] = 22] = "K_With";
  TokenType2[TokenType2["K_Alias"] = 23] = "K_Alias";
  TokenType2[TokenType2["K_Adrs"] = 24] = "K_Adrs";
  TokenType2[TokenType2["K_Sizeof"] = 25] = "K_Sizeof";
  TokenType2[TokenType2["K_Transform"] = 26] = "K_Transform";
  TokenType2[TokenType2["K_Trans"] = 27] = "K_Trans";
  TokenType2[TokenType2["K_To"] = 28] = "K_To";
  TokenType2[TokenType2["K_New"] = 29] = "K_New";
  TokenType2[TokenType2["K_Sub"] = 30] = "K_Sub";
  TokenType2[TokenType2["K_Free"] = 31] = "K_Free";
  TokenType2[TokenType2["K_Allocator"] = 32] = "K_Allocator";
  TokenType2[TokenType2["K_Volatile"] = 33] = "K_Volatile";
  TokenType2[TokenType2["K_u8"] = 34] = "K_u8";
  TokenType2[TokenType2["K_u16"] = 35] = "K_u16";
  TokenType2[TokenType2["K_u32"] = 36] = "K_u32";
  TokenType2[TokenType2["K_u64"] = 37] = "K_u64";
  TokenType2[TokenType2["K_i8"] = 38] = "K_i8";
  TokenType2[TokenType2["K_i16"] = 39] = "K_i16";
  TokenType2[TokenType2["K_i32"] = 40] = "K_i32";
  TokenType2[TokenType2["K_i64"] = 41] = "K_i64";
  TokenType2[TokenType2["K_f32"] = 42] = "K_f32";
  TokenType2[TokenType2["K_f64"] = 43] = "K_f64";
  TokenType2[TokenType2["Underscore"] = 44] = "Underscore";
  TokenType2[TokenType2["ScanningState"] = 45] = "ScanningState";
  TokenType2[TokenType2["Identifier"] = 46] = "Identifier";
  TokenType2[TokenType2["Integer"] = 47] = "Integer";
  TokenType2[TokenType2["RealNumber"] = 48] = "RealNumber";
  TokenType2[TokenType2["Dot"] = 49] = "Dot";
  TokenType2[TokenType2["LBrace"] = 50] = "LBrace";
  TokenType2[TokenType2["RBrace"] = 51] = "RBrace";
  TokenType2[TokenType2["LSquareBrace"] = 52] = "LSquareBrace";
  TokenType2[TokenType2["RSquareBrace"] = 53] = "RSquareBrace";
  TokenType2[TokenType2["LBracket"] = 54] = "LBracket";
  TokenType2[TokenType2["RBracket"] = 55] = "RBracket";
  TokenType2[TokenType2["Semicolon"] = 56] = "Semicolon";
  TokenType2[TokenType2["Assignment"] = 57] = "Assignment";
  TokenType2[TokenType2["Compare"] = 58] = "Compare";
  TokenType2[TokenType2["Comma"] = 59] = "Comma";
  TokenType2[TokenType2["Add"] = 60] = "Add";
  TokenType2[TokenType2["Increment"] = 61] = "Increment";
  TokenType2[TokenType2["String"] = 62] = "String";
  TokenType2[TokenType2["Colon"] = 63] = "Colon";
  TokenType2[TokenType2["DoubleColon"] = 64] = "DoubleColon";
  TokenType2[TokenType2["Minus"] = 65] = "Minus";
  TokenType2[TokenType2["AtSymbol"] = 66] = "AtSymbol";
  TokenType2[TokenType2["HashSymbol"] = 67] = "HashSymbol";
  TokenType2[TokenType2["Backtick"] = 68] = "Backtick";
  TokenType2[TokenType2["Multiply"] = 69] = "Multiply";
  TokenType2[TokenType2["Divide"] = 70] = "Divide";
  TokenType2[TokenType2["DollarSign"] = 71] = "DollarSign";
  TokenType2[TokenType2["StraightBar"] = 72] = "StraightBar";
  TokenType2[TokenType2["Decrement"] = 73] = "Decrement";
  TokenType2[TokenType2["ArrowRight"] = 74] = "ArrowRight";
  TokenType2[TokenType2["GreaterThan"] = 75] = "GreaterThan";
  TokenType2[TokenType2["GreaterThanEqual"] = 76] = "GreaterThanEqual";
  TokenType2[TokenType2["LessThan"] = 77] = "LessThan";
  TokenType2[TokenType2["LessThanEqual"] = 78] = "LessThanEqual";
  TokenType2[TokenType2["Negation"] = 79] = "Negation";
  TokenType2[TokenType2["NotEqual"] = 80] = "NotEqual";
  TokenType2[TokenType2["EOF"] = 81] = "EOF";
  TokenType2[TokenType2["UNDEFINED"] = 82] = "UNDEFINED";
})(TokenType ||= {});

class Token {
  tokenType;
  span;
  row;
  column;
  constructor(tokenType, span, row, column) {
    this.tokenType = tokenType;
    this.span = span;
    this.row = row;
    this.column = column;
  }
}

// ../../lexer/helper.ts
class TokenizeBase {
  sourceContainer;
  source;
  keywords = new Map(Object.keys(TokenType).filter((k) => k.startsWith("K_") && Number.isNaN(Number(k))).map((k) => [k.slice(2).toLowerCase(), TokenType[k]]));
  tokens = [];
  row = 0;
  col = 0;
  span_start = 0;
  span_end = 0;
  presentState = 45 /* ScanningState */;
  constructor(sourceContainer, source) {
    this.sourceContainer = sourceContainer;
    this.source = source;
  }
  jump() {
    this.span_start = this.span_end;
  }
  advance() {
    this.span_end++;
    this.span_start = this.span_end;
  }
  peek() {
    if (this.span_end + 1 < this.source.length) {
      return this.source.charAt(this.span_end + 1);
    } else {
      return null;
    }
  }
  emit() {
    let endIndex = this.span_end - this.span_start == 0 ? this.span_end : this.span_end - 1;
    if (this.presentState == 46 /* Identifier */) {
      const comparable = this.source.substring(this.span_start, this.span_end);
      if (this.keywords.has(comparable)) {
        this.tokens.push(new Token(this.keywords.get(comparable), new StringSpan(this.span_start, endIndex, this.sourceContainer), this.row, this.col));
      } else {
        this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start, endIndex, this.sourceContainer), this.row, this.col));
      }
    } else if (this.presentState == 62 /* String */) {
      this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start + 1, endIndex - 1, this.sourceContainer), this.row, this.col));
    } else {
      this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start, endIndex, this.sourceContainer), this.row, this.col));
    }
    this.presentState = 45 /* ScanningState */;
  }
  emitAndAdvance() {
    this.emit();
    this.advance();
  }
  ignore() {
    if (this.presentState != 45 /* ScanningState */) {
      this.emitAndAdvance();
    } else {
      this.advance();
    }
  }
  pureEmit() {
    if (this.presentState == 46 /* Identifier */) {
      const comparable = this.source.substring(this.span_start, this.span_end);
      if (this.keywords.has(comparable)) {
        this.tokens.push(new Token(this.keywords.get(comparable), new StringSpan(this.span_start, this.span_end, this.sourceContainer), this.row, this.col));
      } else {
        this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start, this.span_end, this.sourceContainer), this.row, this.col));
      }
    } else if (this.presentState == 62 /* String */) {
      this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start + 1, this.span_end - 1, this.sourceContainer), this.row, this.col));
    } else {
      this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start, this.span_end, this.sourceContainer), this.row, this.col));
    }
    this.presentState = 45 /* ScanningState */;
  }
}

// ../../lexer/error.ts
class ErrorHandling extends TokenizeBase {
  logCharError(char, message) {
    const source = this.sourceContainer.str;
    const position = this.span_end;
    const row = source.slice(0, position).split(`
`).length;
    const lastNewline = source.lastIndexOf(`
`, position - 1);
    const col = position - lastNewline;
    log({
      type: 0 /* Error */,
      where: "TOKENIZER",
      title: message,
      description: `Unexpected character ${JSON.stringify(char)} ` + `at row ${row}, col ${col}.`
    });
    process.exit(1);
  }
}

// ../../lexer/string.ts
class ProcessStringToken extends ErrorHandling {
  processString(start) {
    let endSpan = start;
    var StringState;
    ((StringState2) => {
      StringState2[StringState2["Consume"] = 0] = "Consume";
      StringState2[StringState2["Escape"] = 1] = "Escape";
    })(StringState ||= {});
    let localState = 0 /* Consume */;
    while (true) {
      let char = this.source.charAt(endSpan);
      if (char == "")
        return endSpan;
      if (char == `
`) {
        this.logCharError(char, "String cannot contain newline characters");
      }
      if (char == "\\") {
        if (localState == 0 /* Consume */) {
          localState = 1 /* Escape */;
          endSpan++;
          continue;
        } else {
          localState = 0 /* Consume */;
          endSpan++;
          continue;
        }
      }
      if (char == '"') {
        if (localState == 0 /* Consume */) {
          return endSpan;
        } else {
          endSpan++;
          localState = 0 /* Consume */;
          continue;
        }
      }
      if (localState == 1 /* Escape */) {
        localState = 0 /* Consume */;
      }
      endSpan++;
    }
  }
}

// ../../lexer/comment.ts
class TokenizeComments extends ProcessStringToken {
  processInlineComment() {
    this.advance();
    this.advance();
    while (this.source.charAt(this.span_end) != `
`) {
      this.advance();
    }
  }
  processInplaceComment() {
    this.advance();
    this.advance();
    while (true) {
      if (this.span_end == this.source.length) {
        return;
      }
      if (this.source.charAt(this.span_end) == "*") {
        if (this.peek() == "/") {
          this.advance();
          this.advance();
          return;
        }
      }
      this.advance();
    }
  }
}

// ../../lexer/tokenizer.ts
class Tokenizer extends TokenizeComments {
  constructor(source) {
    super(new StringContainer(source), source);
    this.source = this.source.replace(/\r/g, "");
    this.sourceContainer.str = this.source;
  }
  soloCharacter(token) {
    if (this.presentState == 45 /* ScanningState */) {
      this.presentState = token;
      this.emitAndAdvance();
    } else {
      this.emit();
      this.jump();
      this.presentState = token;
      this.emitAndAdvance();
    }
  }
  doubleCharacter(base, extends_to, check) {
    const next = this.peek();
    if (next == check) {
      if (this.presentState == 45 /* ScanningState */) {
        this.presentState = extends_to;
        this.jump();
        this.span_end++;
        this.pureEmit();
        this.advance();
      } else {
        this.emit();
        this.jump();
        this.presentState = extends_to;
        this.span_end++;
        this.pureEmit();
        this.advance();
      }
    } else {
      this.soloCharacter(base);
    }
  }
  tokenize() {
    while (true) {
      if (this.span_end >= this.source.length) {
        if (this.span_end == this.span_start)
          break;
        if (this.span_end > this.span_start) {
          this.emitAndAdvance();
          break;
        }
      }
      switch (this.source.charAt(this.span_end)) {
        case " ":
        case "\r":
        case `
`:
        case "\t":
          this.ignore();
          break;
        default:
          const char = this.source.charAt(this.span_end);
          const codePoint = char.charCodeAt(0);
          if (65 <= codePoint && codePoint <= 90 || 97 <= codePoint && codePoint <= 122 || char == "_") {
            if (this.presentState == 45 /* ScanningState */) {
              this.presentState = 46 /* Identifier */;
              this.jump();
            } else if (this.presentState == 46 /* Identifier */) {
              this.span_end++;
            } else {
              this.emitAndAdvance();
              this.presentState = 46 /* Identifier */;
              this.advance();
            }
            continue;
          }
          if (48 <= codePoint && codePoint <= 57) {
            if (this.presentState == 45 /* ScanningState */) {
              this.presentState = 47 /* Integer */;
              this.span_end++;
            } else if (this.presentState == 46 /* Identifier */) {
              this.span_end++;
            } else if (this.presentState == 47 /* Integer */) {
              this.span_end++;
            } else if (this.presentState == 48 /* RealNumber */) {
              this.span_end++;
            } else {
              this.emitAndAdvance();
              this.presentState = 47 /* Integer */;
            }
            continue;
          }
          if (char == ".") {
            if (this.presentState == 47 /* Integer */) {
              this.presentState = 48 /* RealNumber */;
              this.span_end++;
            } else if (this.presentState == 48 /* RealNumber */) {
              throw Error("Real number cannot have multiple decimal points");
            } else if (this.presentState == 45 /* ScanningState */) {
              this.presentState = 49 /* Dot */;
              this.emitAndAdvance();
            } else {
              this.emit();
              this.jump();
              this.presentState = 49 /* Dot */;
              this.emitAndAdvance();
            }
            continue;
          }
          if (char == "(") {
            this.soloCharacter(50 /* LBrace */);
            continue;
          }
          if (char == ")") {
            this.soloCharacter(51 /* RBrace */);
            continue;
          }
          if (char == "[") {
            this.soloCharacter(52 /* LSquareBrace */);
            continue;
          }
          if (char == "]") {
            this.soloCharacter(53 /* RSquareBrace */);
            continue;
          }
          if (char == "{") {
            this.soloCharacter(54 /* LBracket */);
            continue;
          }
          if (char == "$") {
            this.soloCharacter(71 /* DollarSign */);
            continue;
          }
          if (char == "|") {
            this.soloCharacter(72 /* StraightBar */);
            continue;
          }
          if (char == "}") {
            this.soloCharacter(55 /* RBracket */);
            continue;
          }
          if (char == ",") {
            this.soloCharacter(59 /* Comma */);
            continue;
          }
          if (char == ";") {
            this.soloCharacter(56 /* Semicolon */);
            continue;
          }
          if (char == "#") {
            this.soloCharacter(67 /* HashSymbol */);
            continue;
          }
          if (char == "`") {
            this.soloCharacter(68 /* Backtick */);
            continue;
          }
          if (char == "*") {
            this.soloCharacter(69 /* Multiply */);
            continue;
          }
          if (char == "/") {
            const next = this.peek();
            if (next == "/") {
              this.presentState = 45 /* ScanningState */;
              this.processInlineComment();
            } else if (next == "*") {
              this.presentState = 45 /* ScanningState */;
              this.processInplaceComment();
            } else {
              this.soloCharacter(70 /* Divide */);
            }
            continue;
          }
          if (char == "@") {
            this.soloCharacter(66 /* AtSymbol */);
            continue;
          }
          if (char == "-") {
            const next = this.peek();
            if (next == ">") {
              if (this.presentState == 45 /* ScanningState */) {
                this.presentState = 74 /* ArrowRight */;
                this.jump();
                this.span_end++;
                this.pureEmit();
                this.advance();
              } else {
                this.emit();
                this.jump();
                this.presentState = 74 /* ArrowRight */;
                this.span_end++;
                this.pureEmit();
                this.advance();
              }
            } else if (next == "-") {
              if (this.presentState == 45 /* ScanningState */) {
                this.presentState = 73 /* Decrement */;
                this.jump();
                this.span_end++;
                this.pureEmit();
                this.advance();
              } else {
                this.emit();
                this.jump();
                this.presentState = 73 /* Decrement */;
                this.span_end++;
                this.pureEmit();
                this.advance();
              }
            } else {
              this.soloCharacter(65 /* Minus */);
            }
            continue;
          }
          if (char == ":") {
            this.doubleCharacter(63 /* Colon */, 64 /* DoubleColon */, ":");
            continue;
          }
          if (char == "!") {
            this.doubleCharacter(79 /* Negation */, 80 /* NotEqual */, "=");
            continue;
          }
          if (char == "<") {
            this.doubleCharacter(77 /* LessThan */, 78 /* LessThanEqual */, "=");
            continue;
          }
          if (char == ">") {
            this.doubleCharacter(75 /* GreaterThan */, 76 /* GreaterThanEqual */, "=");
            continue;
          }
          if (char == "+") {
            this.doubleCharacter(60 /* Add */, 61 /* Increment */, "+");
            continue;
          }
          if (char == "=") {
            this.doubleCharacter(57 /* Assignment */, 58 /* Compare */, "=");
            continue;
          }
          if (char == '"') {
            if (this.presentState == 45 /* ScanningState */) {
              this.jump();
              this.span_end = this.processString(this.span_end + 1);
              this.presentState = 62 /* String */;
              this.pureEmit();
              this.advance();
            } else {
              this.emit();
              this.jump();
              this.span_end = this.processString(this.span_end + 1);
              this.presentState = 62 /* String */;
              this.pureEmit();
              this.advance();
            }
            continue;
          }
          this.logCharError(char, "Unrecognized Character");
      }
    }
    this.tokens.push(new Token(81 /* EOF */, new StringSpan(this.source.length, this.source.length, this.sourceContainer), this.row, this.col));
  }
}

// ../errors.ts
class ParserDiagnostic {
  title;
  parser;
  token;
  constructor(title, parser, token) {
    this.title = title;
    this.parser = parser;
    this.token = token;
  }
  print() {
    this.parser.logTokenError(this.token, this.title);
  }
}

// ../utility/plog.ts
function log2(type, stage, message, description) {
  const RESET2 = "\x1B[0m";
  const BOLD2 = "\x1B[1m";
  const DIM = "\x1B[2m";
  const BG_ERROR = "\x1B[41m\x1B[37m";
  const BG_WARN = "\x1B[43m\x1B[30m";
  const BG_INFO = "\x1B[44m\x1B[37m";
  const TEXT_ERROR = "\x1B[31m";
  const TEXT_WARN = "\x1B[33m";
  const TEXT_INFO = "\x1B[36m";
  let label = "";
  let accentColor = "";
  switch (type) {
    case 1 /* Error */:
      label = `${BG_ERROR} ERROR ${RESET2}`;
      accentColor = TEXT_ERROR;
      break;
    case 0 /* Warning */:
      label = `${BG_WARN} WARN  ${RESET2}`;
      accentColor = TEXT_WARN;
      break;
    case 2 /* Info */:
      label = `${BG_INFO} INFO  ${RESET2}`;
      accentColor = TEXT_INFO;
      break;
  }
  const timestamp = new Date().toTimeString().split(" ")[0];
  console.log(`${DIM}[${timestamp}]${RESET2} ` + `${label} ` + `${accentColor}${BOLD2}[${stage.toUpperCase()}]${RESET2} ` + `${BOLD2}${message}${RESET2}`);
  if (description) {
    console.log(`${DIM}  \u2514\u2500 ${description}${RESET2}
`);
  }
}

// ../base.ts
class ParserBase {
  tokenStream;
  source;
  diagnostics = [];
  isRecovery = false;
  recoveryCausedBy = 82 /* UNDEFINED */;
  tokenIndex = 0;
  constructor(tokenStream, source) {
    this.tokenStream = tokenStream;
    this.source = source;
  }
  peek(amount = 0) {
    if (this.tokenStream.length > amount + this.tokenIndex) {
      return this.tokenStream[amount + this.tokenIndex];
    }
  }
  consume(tokens) {
    this.tokenIndex += tokens;
  }
  digest({ expected, sync, title }) {
    let digestedString = "";
    const _thisToken = this.peek();
    const result = this.expect(_thisToken, expected, () => {
      digestedString = this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1);
    });
    this.syncToken(result, sync, title, _thisToken);
    return digestedString;
  }
  advance() {
    this.consume(1);
  }
  expect(given, expected, callback) {
    if (given.tokenType == expected) {
      if (callback != null)
        callback();
      return true;
    }
    return false;
  }
  report(title, token) {
    this.diagnostics.push(new ParserDiagnostic(title, this, token));
  }
  syncToken(result, sync, title, token) {
    if (!this.isRecovery && result) {
      this.advance();
    }
    if (this.isRecovery && result) {
      this.isRecovery = false;
      this.recoveryCausedBy = 82 /* UNDEFINED */;
      this.advance();
      return;
    }
    if (!this.isRecovery && !result) {
      this.diagnostics.push(new ParserDiagnostic(title, this, token));
      this.isRecovery = true;
      this.recoveryCausedBy = token.tokenType;
      while (!sync.has(this.peek().tokenType)) {
        this.advance();
      }
    }
  }
  match({ expected, sync, title }) {
    const token = this.peek();
    const result = this.expect(token, expected);
    this.syncToken(result, sync, title, token);
  }
  start() {
    const start = this.peek().span.startIndex;
    return (node, offset = 0) => {
      node.start = start;
      node.end = this.peek(offset).span.endIndex;
      return node;
    };
  }
  print() {
    for (let diag of this.diagnostics) {
      diag.print();
    }
  }
  resolveSpan(start) {
    const upToStart = this.source.str.substring(0, start);
    const lineNum = upToStart.split(`
`).length - 1;
    const lastNL = upToStart.lastIndexOf(`
`);
    const col = start - (lastNL + 1);
    const line = this.source.str.split(`
`)[lineNum] ?? "";
    const caretPad = " ".repeat(line.substring(0, col).replace(/\t/g, "    ").length);
    return { line, lineNum, caretPad };
  }
  logTokenError(token, message) {
    const RESET2 = "\x1B[0m";
    const BOLD2 = "\x1B[1m";
    const DIM = "\x1B[2m";
    const TEXT_ERROR = "\x1B[31m";
    const TEXT_BLUE = "\x1B[34m";
    const tokenName = TokenType[token.tokenType] ?? "Unknown";
    const tokenText = token.span.resolve();
    const { line, lineNum, caretPad } = this.resolveSpan(token.span.startIndex);
    const caretLen = Math.max(token.span.endIndex - token.span.startIndex + 1, 1);
    const lineLabel = String(lineNum + 1);
    const pad = " ".repeat(lineLabel.length);
    log2(1 /* Error */, "PARSER", message, `${TEXT_BLUE}${BOLD2} ${RESET2}line ${lineNum + 1}, col ${caretPad.length + 1}`);
    console.log(`${TEXT_BLUE}${BOLD2}${pad}  |${RESET2}`);
    console.log(`${TEXT_BLUE}${BOLD2}${lineLabel}  |${RESET2} ${line}`);
    console.log(`${TEXT_BLUE}${BOLD2}${pad}  |${RESET2} ${TEXT_ERROR}${BOLD2}${caretPad}${"^".repeat(caretLen)}${RESET2}`);
    console.log(`${TEXT_BLUE}${BOLD2}${pad}  |${RESET2} ${DIM}token: ${tokenName} (${JSON.stringify(tokenText)})${RESET2}`);
    console.log();
  }
}

// ../ast.ts
var NodeType;
((NodeType2) => {
  NodeType2[NodeType2["Program"] = 0] = "Program";
  NodeType2[NodeType2["Empty"] = 1] = "Empty";
  NodeType2[NodeType2["Function"] = 2] = "Function";
  NodeType2[NodeType2["Using"] = 3] = "Using";
  NodeType2[NodeType2["Identifier"] = 4] = "Identifier";
  NodeType2[NodeType2["IncludeAllPath"] = 5] = "IncludeAllPath";
  NodeType2[NodeType2["IncludePath"] = 6] = "IncludePath";
  NodeType2[NodeType2["BinaryOps"] = 7] = "BinaryOps";
  NodeType2[NodeType2["Import"] = 8] = "Import";
})(NodeType ||= {});

class Node {
  type;
  typeName;
  start = 0;
  end = 0;
  constructor(type) {
    this.type = type;
    this.typeName = NodeType[type];
  }
}

class EmptyNode extends Node {
  name;
  constructor(name) {
    super(1 /* Empty */);
    this.name = name;
  }
}

// ../utility/branch.ts
function createBranch(production, ...tokens) {
  const branchMap = new Map;
  for (let token of tokens) {
    branchMap.set(token, production);
  }
  return branchMap;
}
function branchGroup(...branches) {
  const flattenMap = new Map;
  for (let branch of branches) {
    for (let [key, value] of branch) {
      flattenMap.set(key, value);
    }
  }
  return flattenMap;
}
function useBranch(parser, branchTable, title, sync) {
  const token = parser.peek();
  const production = branchTable.get(token.tokenType);
  if (production !== undefined) {
    return production(parser, sync, title);
  }
  parser.syncToken(false, sync, title, token);
  return new EmptyNode("From Branching");
}

// ../utility/extension.ts
function createExtension(extension, ...associatedTokens) {
  const extensionMap = new Map;
  for (let token of associatedTokens) {
    extensionMap.set(token, extension);
  }
  return extensionMap;
}
function extensionGroup(...extensions) {
  const flattenMap = new Map;
  for (let extension of extensions) {
    for (let [key, value] of extension) {
      flattenMap.set(key, value);
    }
  }
  return flattenMap;
}
function useExtension(parser, overlap, extensions, sync) {
  const output = overlap();
  let fx = extensions.get(parser.peek().tokenType);
  if (fx != null) {
    return fx(parser, output, sync);
  }
  return output;
}

// ../parser.ts
class Parser extends ParserBase {
  useBranch(branchTable, title, sync) {
    return useBranch(this, branchTable, title, sync);
  }
  useExtension(overlap, extension, sync) {
    return useExtension(this, overlap, extension, sync);
  }
}

// ../rules/types.ts
var BuiltinType;
((BuiltinType) => {
  BuiltinType.first = new Set([
    34 /* K_u8 */,
    35 /* K_u16 */,
    36 /* K_u32 */,
    37 /* K_u64 */,
    38 /* K_i8 */,
    39 /* K_i16 */,
    40 /* K_i32 */,
    41 /* K_i64 */,
    42 /* K_f32 */,
    43 /* K_f64 */
  ]);
  function parse(parser, sync) {
    const type = parser.peek();
    if (BuiltinType.first.has(type.tokenType)) {
      parser.advance();
      return {
        is: "built-in-type",
        type,
        name: TokenType[type.tokenType]
      };
    }
    parser.report("Expected a built-in type keyword", type);
    return new EmptyNode("From built-in type");
  }
  BuiltinType.parse = parse;
})(BuiltinType ||= {});
var CompositeType;
((CompositeType) => {
  CompositeType.first = Atom.first;
  const identifierSequenceExtension = createBranch((parser, sync) => {
    parser.advance();
    const paths = [];
    paths.push(parser.digest({
      expected: 46 /* Identifier */,
      sync: sync.union(new Set([46 /* Identifier */, 51 /* RBrace */, 59 /* Comma */])),
      title: "Requires atleast one identifier in brackets"
    }));
    while (true) {
      const tokenRoot = parser.peek();
      const token = tokenRoot.tokenType;
      if (sync.has(token) && token != 51 /* RBrace */ && token != 59 /* Comma */ && token != 46 /* Identifier */) {
        parser.syncToken(false, sync, "Expected a closing ')' bracket", tokenRoot);
        break;
      }
      if (token == 51 /* RBrace */) {
        parser.advance();
        break;
      }
      if (token == 46 /* Identifier */) {
        parser.report("Provide a separator, ',' (COMMA) before a name", tokenRoot);
        paths.push(parser.digest({
          expected: 46 /* Identifier */,
          sync: sync.union(new Set([46 /* Identifier */, 51 /* RBrace */, 59 /* Comma */])),
          title: ""
        }));
        continue;
      }
      if (token == 59 /* Comma */) {
        parser.advance();
        paths.push(parser.digest({
          expected: 46 /* Identifier */,
          sync: sync.union(new Set([46 /* Identifier */, 51 /* RBrace */, 59 /* Comma */])),
          title: "Expected an identifier for the composite type"
        }));
        continue;
      }
      parser.match({
        expected: 59 /* Comma */,
        sync,
        title: "Expected a comma separator, got something else"
      });
    }
    return paths;
  }, 50 /* LBrace */);
  const identifierExtension = createBranch((parser, sync) => {
    return parser.digest({
      expected: 46 /* Identifier */,
      sync,
      title: "Expected an identifier for the composite type"
    });
  }, 46 /* Identifier */);
  const btable = branchGroup(identifierExtension, identifierSequenceExtension);
  function parse(parser, sync) {
    return parser.useExtension(() => {
      const node = Atom.parse(parser, sync.union(new Set([64 /* DoubleColon */, 50 /* LBrace */, 46 /* Identifier */, 51 /* RBrace */, 59 /* Comma */])));
      return node;
    }, createExtension((parser2, from, sync2) => {
      parser2.advance();
      const branch = parser2.useBranch(btable, "Expected identifier or a sequence of identifiers", sync2);
      return {
        is: "composite-type",
        from,
        over: branch
      };
    }, 64 /* DoubleColon */), sync);
  }
  CompositeType.parse = parse;
})(CompositeType ||= {});
var TypeAtom;
((TypeAtom) => {
  TypeAtom.first = BuiltinType.first.union(CompositeType.first).union(new Set([46 /* Identifier */, 67 /* HashSymbol */, 53 /* RSquareBrace */, 68 /* Backtick */]));
  const builtinBranch = createBranch((parser, sync) => BuiltinType.parse(parser, sync), ...BuiltinType.first);
  const compositeBranch = createBranch((parser, sync) => CompositeType.parse(parser, sync), ...CompositeType.first);
  const handleTypeBranch = createBranch((parser, sync) => {
    parser.advance();
    return {
      is: "handle-type",
      type: Type.parse(parser, sync)
    };
  }, 67 /* HashSymbol */);
  const referenceTypeBranch = createBranch((parser, sync) => {
    parser.advance();
    return {
      is: "reference-type",
      type: Type.parse(parser, sync)
    };
  }, 68 /* Backtick */);
  const pointerTypeBranch = createBranch((parser, sync) => {
    parser.advance();
    const type = Type.parse(parser, sync.union(new Set([53 /* RSquareBrace */])));
    parser.match({
      expected: 53 /* RSquareBrace */,
      sync,
      title: "Expected a closing ']' here"
    });
    return {
      is: "pointer-type",
      type
    };
  }, 52 /* LSquareBrace */);
  const branchTable = branchGroup(pointerTypeBranch, referenceTypeBranch, builtinBranch, compositeBranch, handleTypeBranch);
  function parse(parser, sync) {
    return parser.useBranch(branchTable, "Expected a valid token to start type.", sync);
  }
  TypeAtom.parse = parse;
})(TypeAtom ||= {});
var Type;
((Type) => {
  Type.first = TypeAtom.first;
  const arrayExtension = createExtension((parser, from, sync) => {
    parser.advance();
    const value = parser.digest({
      expected: 47 /* Integer */,
      sync: sync.union(new Set([53 /* RSquareBrace */])),
      title: "Expected an integer for the fixed sized array type"
    });
    parser.match({
      expected: 53 /* RSquareBrace */,
      sync,
      title: "Expected a closing ']' bracket here"
    });
    return parser.useExtension(() => {
      return {
        is: "array-type",
        size: value,
        from
      };
    }, arrayExtension, sync);
  }, 52 /* LSquareBrace */);
  function parse(parser, sync) {
    return parser.useExtension(() => {
      return TypeAtom.parse(parser, sync.union(new Set([52 /* LSquareBrace */, 47 /* Integer */, 53 /* RSquareBrace */])));
    }, arrayExtension, sync);
  }
  Type.parse = parse;
})(Type ||= {});

// ../rules/node.ts
//! PENDING - LET
var Atom;
((Atom) => {
  const identifierBranch = createBranch((parser, sync) => {
    const identifier = parser.digest({
      expected: 46 /* Identifier */,
      sync,
      title: "Expected an identifier"
    });
    return identifier;
  }, 46 /* Identifier */);
  const integerBranch = createBranch((parser, sync) => {
    const number = parser.digest({
      expected: 47 /* Integer */,
      sync,
      title: "Expected an integer"
    });
    return number;
  }, 47 /* Integer */);
  const realNumBranch = createBranch((parser, sync) => {
    const number = parser.digest({
      expected: 48 /* RealNumber */,
      sync,
      title: "Expected a real number"
    });
    return number;
  }, 48 /* RealNumber */);
  const stringBranch = createBranch((parser, sync) => {
    const str = parser.digest({
      expected: 62 /* String */,
      sync,
      title: "Expected a string"
    });
    return str;
  }, 62 /* String */);
  const bracketNodeBranch = createBranch((parser, sync) => {
    parser.match({
      expected: 50 /* LBrace */,
      sync: sync.union(Node3.first).union(new Set([51 /* RBrace */])),
      title: "Expected a starting bracket '('"
    });
    const node = Node3.parse(parser, sync.union(new Set([51 /* RBrace */])));
    parser.match({
      expected: 51 /* RBrace */,
      sync,
      title: "Expected a closing bracket ')'"
    });
    return node;
  }, 50 /* LBrace */);
  const referenceAtomBranch = createBranch((parser, sync) => {
    parser.match({
      expected: 68 /* Backtick */,
      sync: sync.union(Atom.first),
      title: "Expected a backtick"
    });
    const atom = Atom.parse(parser, sync);
    return {
      is: "reference",
      of: atom
    };
  }, 68 /* Backtick */);
  const addressAtomBranch = createBranch((parser, sync) => {
    parser.match({
      expected: 24 /* K_Adrs */,
      sync: sync.union(Atom.first),
      title: "Expected token 'adrs'"
    });
    const atom = Atom.parse(parser, sync);
    return {
      is: "address_of",
      of: atom
    };
  }, 24 /* K_Adrs */);
  const sizeAtomBranch = createBranch((parser, sync) => {
    parser.match({
      expected: 25 /* K_Sizeof */,
      sync: sync.union(Atom.first),
      title: "Expected token 'sizeof'"
    });
    const atom = Atom.parse(parser, sync);
    return {
      is: "size_of",
      of: atom
    };
  }, 25 /* K_Sizeof */);
  const pointerAccessBranch = createBranch((parser, sync) => {
    parser.match({
      expected: 52 /* LSquareBrace */,
      sync: sync.union(new Set([72 /* StraightBar */, 51 /* RBrace */])),
      title: "Expected a starting '[' bracket"
    });
    const center = useExtension(parser, () => Node3.parse(parser, sync), createExtension((parser2, from, sync2) => {
      parser2.advance();
      const node = Node3.parse(parser2, sync2.union(new Set([51 /* RBrace */])));
      return {
        is: "pointer-access",
        left: from,
        right: node
      };
    }, 72 /* StraightBar */), sync);
    parser.match({
      expected: 53 /* RSquareBrace */,
      sync,
      title: "Expected an ending ']' bracket"
    });
    return {
      is: "pointer-access",
      of: center
    };
  }, 52 /* LSquareBrace */);
  const handleAccessBranch = createBranch((parser, sync) => {
    parser.match({
      expected: 67 /* HashSymbol */,
      sync: sync.union(new Set([52 /* LSquareBrace */, 72 /* StraightBar */, 51 /* RBrace */])),
      title: "Expected a hash symbol to start with"
    });
    parser.match({
      expected: 52 /* LSquareBrace */,
      sync: sync.union(new Set([72 /* StraightBar */, 51 /* RBrace */])),
      title: "Expected a starting '[' bracket"
    });
    const center = useExtension(parser, () => Node3.parse(parser, sync), createExtension((parser2, from, sync2) => {
      parser2.advance();
      const node = Node3.parse(parser2, sync2.union(new Set([51 /* RBrace */])));
      return {
        is: "handle-pointer-access",
        left: from,
        right: node
      };
    }, 72 /* StraightBar */), sync);
    parser.match({
      expected: 53 /* RSquareBrace */,
      sync,
      title: "Expected an ending ']' bracket"
    });
    return {
      is: "handle-pointer-access",
      of: center
    };
  }, 67 /* HashSymbol */);
  const branch = branchGroup(handleAccessBranch, pointerAccessBranch, sizeAtomBranch, addressAtomBranch, referenceAtomBranch, identifierBranch, realNumBranch, integerBranch, stringBranch, bracketNodeBranch);
  Atom.first = new Set([
    46 /* Identifier */,
    48 /* RealNumber */,
    47 /* Integer */,
    62 /* String */,
    50 /* LBrace */,
    52 /* LSquareBrace */,
    67 /* HashSymbol */,
    68 /* Backtick */,
    24 /* K_Adrs */,
    25 /* K_Sizeof */
  ]);
  function parse(parser, sync) {
    return parser.useBranch(branch, "Invalid expression start token", sync);
  }
  Atom.parse = parse;
})(Atom ||= {});
var DecideArrayOrCall;
((DecideArrayOrCall) => {
  const arrayAccessExtension = createExtension((parser, from, sync) => {
    parser.match({
      expected: 52 /* LSquareBrace */,
      sync: sync.union(new Set([47 /* Integer */, 53 /* RSquareBrace */])),
      title: "Expected a starting square bracket '[' for array accesor"
    });
    const number = parser.digest({
      expected: 47 /* Integer */,
      sync: sync.union(new Set([53 /* RSquareBrace */])),
      title: "Expected an integer for array addressing"
    });
    parser.match({
      expected: 53 /* RSquareBrace */,
      sync,
      title: "Expected closing square bracket ']' for array accessor"
    });
    const output = {
      is: "array-access",
      from,
      at: number
    };
    return parser.useExtension(() => output, extension, sync);
  }, 52 /* LSquareBrace */);
  const callExtension = createExtension((parser, from, sync) => {
    parser.match({
      expected: 50 /* LBrace */,
      sync: sync.union(new Set([51 /* RBrace */, 59 /* Comma */])).union(Node3.first),
      title: "Expected a starting bracket '(' for call signature"
    });
    const nodes = [];
    if (parser.peek().tokenType == 51 /* RBrace */) {
      parser.advance();
      return {
        callee: from,
        arguments: nodes
      };
    }
    while (true) {
      nodes.push(Node3.parse(parser, sync.union(new Set([50 /* LBrace */, 59 /* Comma */, 51 /* RBrace */]))));
      const token = parser.peek();
      //! REMEMBER THIS CASE.
      //! SINCE EXTERNAL SYNC TOKEN CAN CONTAIN THE TOKENS WE ARE SUPPOSE TO HANDLE
      if (sync.has(token.tokenType) && token.tokenType != 59 /* Comma */ && token.tokenType != 51 /* RBrace */ && !Node3.first.has(token.tokenType)) {
        parser.syncToken(false, sync, "Expected a ')' to end call signature", token);
        break;
      }
      if (token.tokenType == 51 /* RBrace */) {
        parser.advance();
        break;
      }
      if (Node3.first.has(token.tokenType)) {
        parser.report("Make sure to have arguments separated by comma", token);
        continue;
      }
      if (token.tokenType == 59 /* Comma */) {
        parser.advance();
        continue;
      }
      parser.match({
        expected: 59 /* Comma */,
        sync: sync.union(new Set([51 /* RBrace */])).union(Node3.first),
        title: "Expected a comma separator, got something else"
      });
    }
    let output = {
      callee: from,
      arguments: nodes
    };
    return parser.useExtension(() => output, extension, sync);
  }, 50 /* LBrace */);
  const extension = extensionGroup(arrayAccessExtension, callExtension);
  DecideArrayOrCall.first = Atom.first;
  function parse(parser, sync) {
    return parser.useExtension(() => Atom.parse(parser, sync.union(new Set([50 /* LBrace */, 52 /* LSquareBrace */]))), extension, sync);
  }
  DecideArrayOrCall.parse = parse;
})(DecideArrayOrCall ||= {});
var Binding;
((Binding) => {
  const operators = new Set([64 /* DoubleColon */]);
  Binding.first = Atom.first;
  function parse(parser, sync) {
    let left = DecideArrayOrCall.parse(parser, sync.union(operators));
    let token = parser.peek();
    while (operators.has(token.tokenType)) {
      parser.advance();
      left = {
        operator: TokenType[token.tokenType],
        left,
        right: DecideArrayOrCall.parse(parser, sync)
      };
      token = parser.peek();
    }
    return left;
  }
  Binding.parse = parse;
})(Binding ||= {});
var Magnetic;
((Magnetic) => {
  const operators = new Set([74 /* ArrowRight */]);
  Magnetic.first = Atom.first;
  function parse(parser, sync) {
    let left = Binding.parse(parser, sync.union(operators));
    let token = parser.peek();
    while (operators.has(token.tokenType)) {
      parser.advance();
      left = {
        operator: TokenType[token.tokenType],
        left,
        right: Binding.parse(parser, sync)
      };
      token = parser.peek();
    }
    return left;
  }
  Magnetic.parse = parse;
})(Magnetic ||= {});
var Access;
((Access) => {
  const operators = new Set([49 /* Dot */]);
  Access.first = Atom.first;
  function parse(parser, sync) {
    let left = Magnetic.parse(parser, sync.union(operators));
    let token = parser.peek();
    while (operators.has(token.tokenType)) {
      parser.advance();
      left = {
        operator: TokenType[token.tokenType],
        left,
        right: Magnetic.parse(parser, sync)
      };
      token = parser.peek();
    }
    return left;
  }
  Access.parse = parse;
})(Access ||= {});
var Product;
((Product) => {
  const operators = new Set([69 /* Multiply */, 70 /* Divide */]);
  Product.first = Atom.first;
  function parse(parser, sync) {
    let left = Access.parse(parser, sync.union(operators));
    let token = parser.peek();
    while (operators.has(token.tokenType)) {
      parser.advance();
      left = {
        operator: TokenType[token.tokenType],
        left,
        right: Access.parse(parser, sync)
      };
      token = parser.peek();
    }
    return left;
  }
  Product.parse = parse;
})(Product ||= {});
var Sum;
((Sum) => {
  const operators = new Set([60 /* Add */, 65 /* Minus */]);
  Sum.first = Atom.first;
  function parse(parser, sync) {
    let left = Product.parse(parser, sync.union(operators));
    let token = parser.peek();
    while (operators.has(token.tokenType)) {
      parser.advance();
      left = {
        operator: TokenType[token.tokenType],
        left,
        right: Product.parse(parser, sync)
      };
      token = parser.peek();
    }
    return left;
  }
  Sum.parse = parse;
})(Sum ||= {});
var Inequality;
((Inequality) => {
  const operators = new Set([77 /* LessThan */, 75 /* GreaterThan */, 78 /* LessThanEqual */, 76 /* GreaterThanEqual */]);
  Inequality.first = Atom.first;
  function parse(parser, sync) {
    let left = Sum.parse(parser, sync.union(operators));
    let token = parser.peek();
    while (operators.has(token.tokenType)) {
      parser.advance();
      left = {
        operator: TokenType[token.tokenType],
        left,
        right: Sum.parse(parser, sync)
      };
      token = parser.peek();
    }
    return left;
  }
  Inequality.parse = parse;
})(Inequality ||= {});
var Equality;
((Equality) => {
  const operators = new Set([58 /* Compare */, 80 /* NotEqual */]);
  Equality.first = Atom.first;
  function parse(parser, sync) {
    let left = Inequality.parse(parser, sync.union(operators));
    let token = parser.peek();
    while (operators.has(token.tokenType)) {
      parser.advance();
      left = {
        operator: TokenType[token.tokenType],
        left,
        right: Inequality.parse(parser, sync)
      };
      token = parser.peek();
    }
    return left;
  }
  Equality.parse = parse;
})(Equality ||= {});
var Assignment;
((Assignment) => {
  Assignment.first = Atom.first;
  function parse(parser, sync) {
    let left = Equality.parse(parser, sync.union(new Set([57 /* Assignment */])));
    while (parser.peek().tokenType == 57 /* Assignment */) {
      parser.advance();
      left = {
        operator: "=",
        left,
        right: Equality.parse(parser, sync)
      };
    }
    return left;
  }
  Assignment.parse = parse;
})(Assignment ||= {});
var Return;
((Return) => {
  Return.first = new Set([11 /* K_Return */]);
  function parse(parser, sync) {
    const output = parser.useExtension(() => {
      parser.match({
        expected: 11 /* K_Return */,
        sync: sync.union(Assignment.first).union(new Set([56 /* Semicolon */])),
        title: "Expected a return keyword"
      });
      return {
        is: "return-statement"
      };
    }, createExtension((parser2, _, sync2) => {
      return {
        is: "return-statement",
        expr: Assignment.parse(parser2, sync2.union(new Set([56 /* Semicolon */])))
      };
    }, ...Assignment.first.keys()), sync);
    parser.match({
      expected: 56 /* Semicolon */,
      sync,
      title: "Expected a semicolon here"
    });
    return output;
  }
  Return.parse = parse;
})(Return ||= {});
var Break;
((Break) => {
  Break.first = new Set([20 /* K_Break */]);
  function parse(parser, sync) {
    const output = parser.useExtension(() => {
      parser.match({
        expected: 20 /* K_Break */,
        sync: sync.union(new Set([56 /* Semicolon */, 46 /* Identifier */])),
        title: "Expected a break keyword"
      });
      return {
        is: "break-statement"
      };
    }, createExtension((parser2, _, sync2) => {
      return {
        is: "break-statement",
        name: parser2.digest({
          expected: 46 /* Identifier */,
          sync: sync2.union(new Set([56 /* Semicolon */])),
          title: "Expected an identifier for break."
        })
      };
    }, 46 /* Identifier */), sync);
    parser.match({
      expected: 56 /* Semicolon */,
      sync,
      title: "Expected a semicolon here"
    });
    return output;
  }
  Break.parse = parse;
})(Break ||= {});
var Substitution;
((Substitution) => {
  Substitution.first = new Set([30 /* K_Sub */]);
  function parse(parser, sync) {
    parser.match({
      expected: 30 /* K_Sub */,
      sync: sync.union(Node3.first).union(new Set([22 /* K_With */, 56 /* Semicolon */])),
      title: "Expected a sub keyword"
    });
    const node1 = Node3.parse(parser, sync.union(Node3.first).union(new Set([2 /* K_Action */, 56 /* Semicolon */])));
    parser.match({
      expected: 22 /* K_With */,
      sync: sync.union(Node3.first).union(new Set([56 /* Semicolon */])),
      title: "Expected a 'with' keyword"
    });
    const node2 = Node3.parse(parser, sync.union(new Set([56 /* Semicolon */])));
    parser.match({
      expected: 56 /* Semicolon */,
      sync,
      title: "Expected a semicolon"
    });
    return {
      is: "substitution",
      original: node1,
      subs: node2
    };
  }
  Substitution.parse = parse;
})(Substitution ||= {});
var Transformer;
((Transformer) => {
  Transformer.first = new Set([26 /* K_Transform */]);
  function parse(parser, sync) {
    parser.match({
      expected: 26 /* K_Transform */,
      sync: sync.union(new Set([56 /* Semicolon */, 63 /* Colon */, 46 /* Identifier */, 28 /* K_To */])).union(Type.first).union(Assignment.first),
      title: "Expected a transform keyword"
    });
    const from = Assignment.parse(parser, sync.union(new Set([56 /* Semicolon */, 63 /* Colon */, 46 /* Identifier */, 28 /* K_To */])).union(Type.first));
    parser.match({
      expected: 28 /* K_To */,
      sync: sync.union(new Set([56 /* Semicolon */, 63 /* Colon */, 46 /* Identifier */])).union(Type.first),
      title: "Expected keyword 'to'"
    });
    const name = parser.digest({
      expected: 46 /* Identifier */,
      sync: sync.union(new Set([56 /* Semicolon */, 63 /* Colon */])).union(Type.first),
      title: "Expected a name for this transformation"
    });
    parser.match({
      expected: 63 /* Colon */,
      sync: sync.union(new Set([56 /* Semicolon */])).union(Type.first),
      title: "Expected a colon (:) here"
    });
    const type = Type.parse(parser, sync.union(new Set([56 /* Semicolon */])));
    parser.match({
      expected: 56 /* Semicolon */,
      sync,
      title: "Expected a semicolon"
    });
    return {
      is: "transform",
      from,
      name,
      type
    };
  }
  Transformer.parse = parse;
})(Transformer ||= {});
var Statement;
((Statement) => {
  Statement.first = Return.first.union(Break.first).union(Substitution.first).union(Transformer.first);
  const returnBranch = createBranch((parser, sync) => Return.parse(parser, sync), ...Return.first);
  const breakBranch = createBranch((parser, sync) => Break.parse(parser, sync), ...Break.first);
  const subBranch = createBranch((parser, sync) => Substitution.parse(parser, sync), ...Substitution.first);
  const transformerBranch = createBranch((parser, sync) => Transformer.parse(parser, sync), ...Transformer.first);
  const branch = branchGroup(returnBranch, breakBranch, subBranch, transformerBranch);
  function parse(parser, sync) {
    return parser.useBranch(branch, "Expected a valid start to a statement", sync);
  }
  Statement.parse = parse;
})(Statement ||= {});
var NewAllocation;
((NewAllocation) => {
  NewAllocation.first = new Set([29 /* K_New */]);
  function parse(parser, sync) {
    parser.match({
      expected: 29 /* K_New */,
      sync: sync.union(Assignment.first).union(new Set([56 /* Semicolon */, 75 /* GreaterThan */, 46 /* Identifier */, 77 /* LessThan */])),
      title: "Expected the keyword 'new'"
    });
    parser.match({
      expected: 77 /* LessThan */,
      sync: sync.union(Assignment.first).union(new Set([56 /* Semicolon */, 75 /* GreaterThan */, 46 /* Identifier */])),
      title: "Expected a starting angle bracket '<'"
    });
    const name = parser.digest({
      expected: 46 /* Identifier */,
      sync: sync.union(Assignment.first).union(new Set([56 /* Semicolon */, 75 /* GreaterThan */])),
      title: "Expected the allocator itself"
    });
    parser.match({
      expected: 75 /* GreaterThan */,
      sync: sync.union(Assignment.first).union(new Set([56 /* Semicolon */])),
      title: "Expected a closing angle bracket '>'"
    });
    const assignment = Assignment.parse(parser, sync.union(new Set([56 /* Semicolon */])));
    parser.match({
      expected: 56 /* Semicolon */,
      sync,
      title: "Expected a semicolon"
    });
    return {
      is: "new-allocation",
      name,
      expr: assignment
    };
  }
  NewAllocation.parse = parse;
})(NewAllocation ||= {});
var FreeAllocation;
((FreeAllocation) => {
  FreeAllocation.first = new Set([31 /* K_Free */]);
  function parse(parser, sync) {
    parser.match({
      expected: 31 /* K_Free */,
      sync: sync.union(Assignment.first).union(new Set([56 /* Semicolon */, 75 /* GreaterThan */, 46 /* Identifier */, 77 /* LessThan */])),
      title: "Expected the keyword 'new'"
    });
    parser.match({
      expected: 77 /* LessThan */,
      sync: sync.union(Assignment.first).union(new Set([56 /* Semicolon */, 75 /* GreaterThan */, 46 /* Identifier */])),
      title: "Expected a starting angle bracket '<'"
    });
    const name = parser.digest({
      expected: 46 /* Identifier */,
      sync: sync.union(Assignment.first).union(new Set([56 /* Semicolon */, 75 /* GreaterThan */])),
      title: "Expected the allocator itself"
    });
    parser.match({
      expected: 75 /* GreaterThan */,
      sync: sync.union(Assignment.first).union(new Set([56 /* Semicolon */])),
      title: "Expected a closing angle bracket '>'"
    });
    const assignment = Assignment.parse(parser, sync.union(new Set([56 /* Semicolon */])));
    parser.match({
      expected: 56 /* Semicolon */,
      sync,
      title: "Expected a semicolon"
    });
    return {
      is: "free-allocation",
      name,
      expr: assignment
    };
  }
  FreeAllocation.parse = parse;
})(FreeAllocation ||= {});
var Allocator;
((Allocator) => {
  Allocator.first = NewAllocation.first.union(FreeAllocation.first);
  const newAllocBranch = createBranch((parser, sync) => NewAllocation.parse(parser, sync), 29 /* K_New */);
  const freeAllocBranch = createBranch((parser, sync) => FreeAllocation.parse(parser, sync), 31 /* K_Free */);
  const branch = branchGroup(newAllocBranch, freeAllocBranch);
  function parse(parser, sync) {
    return parser.useBranch(branch, "Expected the keyword 'new' or 'free' for allocation", sync);
  }
  Allocator.parse = parse;
})(Allocator ||= {});
var Node3;
((Node) => {
  Node.first = Atom.first;
  const assignmentBranch = createBranch((parser, sync) => Assignment.parse(parser, sync), ...Assignment.first.keys());
  const allocatorBranch = createBranch((parser, sync) => Allocator.parse(parser, sync), ...Allocator.first.keys());
  const statementBranch = createBranch((parser, sync) => Statement.parse(parser, sync), ...Statement.first.keys());
  const branch = branchGroup(allocatorBranch, assignmentBranch, statementBranch);
  function parse(parser, sync) {
    return parser.useBranch(branch, "Expected an expression or allocator statement", sync);
  }
  Node.parse = parse;
})(Node3 ||= {});

// node.test.ts
var tokenizer = new Tokenizer(``);
tokenizer.tokenize();
var tokens = tokenizer.tokens;
var parser = new Parser(tokens, tokenizer.sourceContainer);
var output = Node3.parse(parser, new Set([81 /* EOF */]));
console.log(JSON.stringify(output, null, 2));
parser.print();
