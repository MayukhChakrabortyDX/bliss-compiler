//this code is an example of how branching works in bliss

import { StringContainer, Token, TokenType } from "../lexer/tokens";
import { log, Log } from "../logger/logger";
import type { Node } from "./ast";

//this consists of the base helpers and the fundamental values
export class ParserBase {

    //store all the diagnostics here which we will use to render
    //errors.

    tokenIndex: number = 0;

    constructor(public tokenStream: Token[], public source: StringContainer) {}

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
        }
    }

    maybe(given: Token, expected: TokenType, whenTrue: () => any, whenFalse: () => any) {
        if (given.tokenType == expected) {
            whenTrue()
        } else {
            whenFalse()
        }
    }

    match(expected: TokenType) {
        //a smaller version that's used a LOT
        this.expect(this.peek(0) as Token, expected, () => this.advance())
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

}