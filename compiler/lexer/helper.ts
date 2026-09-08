import { StringContainer, StringSpan, Token, TokenType } from "./tokens"

export class TokenizeBase {

    keywords: Map<string, TokenType> = new Map(

        Object.keys(TokenType)
            .filter((k) => k.startsWith("K_") && Number.isNaN(Number(k)))
            .map((k) => [k.slice(2).toLowerCase(), TokenType[k as keyof typeof TokenType]])

    )

    tokens: Token[] = []
    row = 0;
    col = 0;
    span_start = 0;
    span_end = 0;

    presentState: TokenType = TokenType.ScanningState;

    constructor(public sourceContainer: StringContainer, public source: string) { }

    jump() {
        this.span_start = this.span_end
    }

    advance() {
        this.span_end++; this.span_start = this.span_end;
    }

    peek() {
        if (this.span_end + 1 < this.source.length) {
            return this.source.charAt(this.span_end + 1)
        } else {
            return null
        }
    }

    emit() {
        let endIndex = (this.span_end - this.span_start == 0) ? this.span_end : this.span_end - 1
        //since identifier can also be keywords
        if (this.presentState == TokenType.Identifier) {
            const comparable = this.source.substring(this.span_start, this.span_end)
            if (this.keywords.has(comparable)) {
                this.tokens.push(new Token((this.keywords.get(comparable) as TokenType), new StringSpan(this.span_start, endIndex, this.sourceContainer), this.row, this.col))
            } else {
                this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start, endIndex, this.sourceContainer), this.row, this.col))
            }
        } else if (this.presentState == TokenType.String) {
            this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start + 1, endIndex - 1, this.sourceContainer), this.row, this.col))
        }

        else {
            this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start, endIndex, this.sourceContainer), this.row, this.col))
        }

        this.presentState = TokenType.ScanningState
    }

    emitAndAdvance() {
        this.emit()
        this.advance()
    }

    ignore() {
        if (this.presentState != TokenType.ScanningState) {
            this.emitAndAdvance()
        }
        else {
            this.advance()
        }
    }

    pureEmit() {

        if (this.presentState == TokenType.Identifier) {
            const comparable = this.source.substring(this.span_start, this.span_end)
            if (this.keywords.has(comparable)) {
                this.tokens.push(new Token((this.keywords.get(comparable) as TokenType), new StringSpan(this.span_start, this.span_end, this.sourceContainer), this.row, this.col))
            } else {
                this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start, this.span_end, this.sourceContainer), this.row, this.col))
            }
        }

        else if (this.presentState == TokenType.String) {
            this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start + 1, this.span_end - 1, this.sourceContainer), this.row, this.col))
        }

        else {
            this.tokens.push(new Token(this.presentState, new StringSpan(this.span_start, this.span_end, this.sourceContainer), this.row, this.col))
        }

        this.presentState = TokenType.ScanningState
    }

}