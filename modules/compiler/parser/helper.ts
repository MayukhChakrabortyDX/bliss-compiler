import { Log, log } from "../../logger";
import { TokenType, type StringContainer, type Token } from "../tokenizer/tokens";

//this consists of the base helpers and the fundamental values
export class ParserBase {

    tokenIndex: number = 0;
    constructor(public tokenStream: Token[], public source: StringContainer) { }

    //helpers starts here
    getTokenTypeName(tokenType: TokenType) {
        return TokenType[tokenType]
    }

    peek(amount: number) {
        //tells us what is at that
        if (this.tokenStream.length > amount + this.tokenIndex) {
            return this.tokenStream[amount + this.tokenIndex]
        } else {
            return null
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

    expect(given: Token, expected: TokenType, callback: () => any) {
        if (given.tokenType == expected) {
            callback()
        } else {

            log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${this.getTokenTypeName(given.tokenType)}. Expected token type ${this.getTokenTypeName(expected)} instead`)
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