import { Log, log } from "../../logger";
import { TokenType, type StringContainer, type Token } from "../tokenizer/tokens";

//this consists of the base helpers and the fundamental values
export class ParserBase {

    tokenIndex: number = 0;
    constructor(public tokenStream: Token[], public source: StringContainer) { }

    private resolveSpan(start: number): { line: string; lineNum: number; caretPad: string } {
        const upToStart = this.source.str.substring(0, start);
        const lineNum = upToStart.split("\n").length - 1;
        const lastNL = upToStart.lastIndexOf("\n");
        const col = start - (lastNL + 1);
        const line = this.source.str.split("\n")[lineNum] ?? "";
        const caretPad = " ".repeat(line.substring(0, col).replace(/\t/g, "    ").length);
        return { line, lineNum, caretPad };
    }

    //useful in parser it seems.
    logTokenError(token: Token, message: string): void {
        const RESET = "\x1b[0m";
        const BOLD = "\x1b[1m";
        const DIM = "\x1b[2m";
        const TEXT_ERROR = "\x1b[31m";
        const TEXT_BLUE = "\x1b[34m";

        const tokenName = TokenType[token.tokenType] ?? "Unknown";
        const tokenText = token.span.resolve();
        const { line, lineNum, caretPad } = this.resolveSpan(token.span.startIndex);
        const caretLen = Math.max(token.span.endIndex - token.span.startIndex + 1, 1);
        const lineLabel = String(lineNum + 1);
        const pad = " ".repeat(lineLabel.length);

        console.log(`${TEXT_ERROR}${BOLD}error${RESET}${BOLD}[TOKENIZER]${RESET}: ${message}`);
        console.log(`${TEXT_BLUE}${BOLD}${pad} --> ${RESET}line ${lineNum + 1}, col ${caretPad.length + 1}`);
        console.log(`${TEXT_BLUE}${BOLD}${pad}  |${RESET}`);
        console.log(`${TEXT_BLUE}${BOLD}${lineLabel}  |${RESET} ${line}`);
        console.log(`${TEXT_BLUE}${BOLD}${pad}  |${RESET} ${TEXT_ERROR}${BOLD}${caretPad}${"^".repeat(caretLen)}${RESET}`);
        console.log(`${TEXT_BLUE}${BOLD}${pad}  |${RESET} ${DIM}token: ${tokenName} (${JSON.stringify(tokenText)})${RESET}`);
        console.log();
    }

    //helpers starts here
    getTokenTypeName(tokenType: TokenType) {
        return TokenType[tokenType]
    }

    // expectTill(maximum: number, expected: TokenType) {

    //     let isFound = false;
    //     let ctr = 0;

    //     while(ctr <= maximum) {

    //         if ( (this.peek(ctr) as Token).tokenType == expected ) {
    //             return true
    //         }

    //         ctr++;

    //     }

    //     return isFound

    // }

    //@ts-ignore
    peek(amount: number = 0): Token {
        //tells us what is at that
        if (this.tokenStream.length > amount + this.tokenIndex) {
            //@ts-ignore
            return this.tokenStream[amount + this.tokenIndex]
        }
    }

    consume(tokens: number) {
        //consume this many tokens
        if (this.tokenIndex + tokens > this.tokenStream.length) {
            log(Log.Error, "PARSER", "Internal Error - Token Consumption Failed", "The parser tried to consume tokens from outside the token range")
        }
        this.tokenIndex += tokens; //increase this much
    }

    //digests a token and gives out it's value
    digest(expected: TokenType) {
        let digestedString = ""
        const _thisToken = this.peek(0) as Token
        this.expect(_thisToken, expected, () => {
            digestedString = this.source.str.substring(
                _thisToken.span.startIndex,
                _thisToken.span.endIndex + 1
            )
            this.advance()
        })
        return digestedString
    }

    advance() {
        this.consume(1)
    }

    expect(given: Token, expected: TokenType, callback: () => any, message?: string) {
        if (given.tokenType == expected) {
            callback()
        } else {

            this.logTokenError(given, message == null ? `Unexpected token ${this.getTokenTypeName(given.tokenType)}. Expected token type ${this.getTokenTypeName(expected)} instead` : message)
            process.exit(1)

        }
    }

    maybeExpect(given: Token, expected: TokenType, whenTrue: () => any, whenFalse: () => any) {
        if (given.tokenType == expected) {
            whenTrue()
        } else {
            whenFalse()
        }
    }

    shouldBe(expected: TokenType) {
        //a smaller version that's used a LOT
        this.expect(this.peek(0) as Token, expected, () => this.advance())
    }
}