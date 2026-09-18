//this code is an example of how branching works in bliss

import { StringContainer, Token, TokenType } from "../lexer/tokens";
import type { Node } from "./ast";
import { ParserDiagnostic } from "./errors";
import type { ParseNode } from "./utility/parse_node";

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
            if (this.peek().tokenType != TokenType.EOF) {
                this.advance()
            }

            while (!sync.has(this.peek().tokenType)) {
                this.advance() //advance till the token type is matched
            }
        }

        // if (this.isRecovery && !result) {

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

        return <T extends ParseNode>(node: T, offset: number = 0): T => {
            node.span.start = start;
            node.span.end = this.peek(offset).span.endIndex;

            //console.log( `[${this.source.str.substring( node.start, node.end + 1 )}]` )

            return node;
        };
    }

    print() {

        for (let diag of this.diagnostics) {
            diag.print()
        }

    }

}