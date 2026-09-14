//this code is an example of how branching works in bliss

import { StringContainer, Token, TokenType } from "../lexer/tokens";
import type { Node } from "./ast";
import { ParserDiagnostic } from "./errors";
import { Log, log } from "./utility/plog";

interface MatchProps {
    expected: TokenType, sync: Set<TokenType>, title: string
}
//this consists of the base helpers and the fundamental values
export class ParserBase {

    //store all the diagnostics here which we will use to render
    //errors.

    diagnostics: ParserDiagnostic[] = []
    isRecovery: boolean = false; //this tells the parser is in token-sync-mode.
    recoveryCausedBy: TokenType = TokenType.UNDEFINED
    tokenIndex: number = 0;

    constructor(public tokenStream: Token[], public source: StringContainer) { }

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
        // if (this.tokenIndex + tokens > this.tokenStream.length) {
        //     log(Log.Error, "PARSER", "Internal Error - Token Consumption Failed", "The parser tried to consume tokens from outside the token range")
        // }
        this.tokenIndex += tokens; //increase this much
    }

    //digests a token and gives out it's value
    digest({ expected, sync, title }: MatchProps) {
        let digestedString = ""
        const _thisToken = this.peek()
        const result = this.expect(_thisToken, expected, () => {
            digestedString = this.source.str.substring(
                _thisToken.span.startIndex,
                _thisToken.span.endIndex + 1
            )
        })

        this.syncToken(result, sync, title, _thisToken)
        return digestedString
    }

    advance() {

        //showCallStack()
        this.consume(1)
    }

    expect(given: Token, expected: TokenType, callback?: () => any) {
        if (given.tokenType == expected) {
            if (callback != undefined) callback();
            return true
        }

        return false
    }

    report(title: string, token: Token) {
        this.diagnostics.push(
            new ParserDiagnostic(title, this, token)
        )
    }

    syncToken(result: boolean, sync: Set<TokenType>, title: string, token: Token) {

        if (!this.isRecovery && result) {
            this.advance() //simply advance.
        }

        if (this.isRecovery && result) {

            //when we are syncing and the result is true
            //this means synchronization has been successful
            this.isRecovery = false
            this.recoveryCausedBy = TokenType.UNDEFINED
            this.advance()
            return

        }

        if (!this.isRecovery && !result) {
            //this means a mismatch has happend. We must sync now
            this.diagnostics.push(
                new ParserDiagnostic(title, this, token)
            )
            this.isRecovery = true
            this.recoveryCausedBy = token.tokenType
            while (!sync.has(this.peek().tokenType)) {
                this.advance() //advance till the token type is matched
            }
        }

        // if ( this.isRecovery && !result ) {

        //     //this means a future sync is in place and this rule
        //     //is not suppose to sync.

        // }
    }

    match({ expected, sync, title }: MatchProps) {

        //a smaller version that's used a LOT
        const token = this.peek()
        const result = this.expect(token, expected)
        this.syncToken(result, sync, title, token)

    }

    start() {
        const start = this.peek().span.startIndex;

        return <T extends Node>(node: T, offset: number = 0): T => {
            node.start = start;
            node.end = this.peek(offset).span.endIndex;

            //console.log( `[${this.source.str.substring( node.start, node.end + 1 )}]` )

            return node;
        };
    }

    print() {

        for (let diag of this.diagnostics) {
            diag.print()
        }

    }

    ///////////////////////////////////////////

    resolveSpan(start: number): { line: string; lineNum: number; caretPad: string } {
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

        log(Log.Error, "PARSER", message, `${TEXT_BLUE}${BOLD} ${RESET}line ${lineNum + 1}, col ${caretPad.length + 1}`)
        console.log(`${TEXT_BLUE}${BOLD}${pad}  |${RESET}`);
        console.log(`${TEXT_BLUE}${BOLD}${lineLabel}  |${RESET} ${line}`);
        console.log(`${TEXT_BLUE}${BOLD}${pad}  |${RESET} ${TEXT_ERROR}${BOLD}${caretPad}${"^".repeat(caretLen)}${RESET}`);
        console.log(`${TEXT_BLUE}${BOLD}${pad}  |${RESET} ${DIM}token: ${tokenName} (${JSON.stringify(tokenText)})${RESET}`);
        console.log();
    }

}