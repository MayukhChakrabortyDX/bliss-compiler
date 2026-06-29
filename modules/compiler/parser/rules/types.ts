import { Token, TokenType } from "../../tokenizer/tokens";
import { CompositeTypeNode, HandlePointerValue, PointerValue, ReferenceValue, ScalarTypeNode, ViewPointerValue, type TypeNode } from "../ast";
import { ParseExpressions } from "./expressions";

export class ParseTypes extends ParseExpressions {

    parseCompositeType() {

        let dataName = this.digest(TokenType.Identifier)
        this.shouldBe(TokenType.DoubleColon)

        const bindingNames: string[] = []

        //if condition
        const _nextToken = this.peek(0) as Token
        if (_nextToken.tokenType == TokenType.Identifier) {

            bindingNames.push(
                this.source.str.substring(
                    _nextToken.span.startIndex,
                    _nextToken.span.endIndex + 1
                )
            )

            this.advance()
            return new CompositeTypeNode(dataName, bindingNames)

        }

        //otherwise
        this.shouldBe(TokenType.LBrace)


        this.expect(this.peek(0) as Token, TokenType.Identifier, () => {
            const _thisToken = this.peek(0) as Token
            bindingNames.push(
                this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1)
            )
            this.advance()
        })

        //now we can analyze if the consequent ones are also identifiers or not
        while ((this.peek(0) as Token).tokenType != TokenType.RBrace) {

            //! Take note of this pattern.
            this.shouldBe(TokenType.Comma)

            const __token = this.peek(0) as Token;
            this.expect(__token, TokenType.Identifier, () => {
                bindingNames.push(
                    this.source.str.substring(__token.span.startIndex, __token.span.endIndex + 1)
                )
                this.advance()
            })

        }

        this.shouldBe(TokenType.RBrace)

        return new CompositeTypeNode(dataName, bindingNames)

    }

    parseType(): TypeNode {

        const token = this.peek(0) as Token;

        switch (token.tokenType) {

            case TokenType.K_u8:
            case TokenType.K_u16:
            case TokenType.K_u32:
            case TokenType.K_u64:
            case TokenType.K_i8:
            case TokenType.K_i16:
            case TokenType.K_i32:
            case TokenType.K_i64:
            case TokenType.K_f32:
            case TokenType.K_f64:
            case TokenType.K_Ptr:
            case TokenType.Identifier:
                if (this.peek(1)?.tokenType == TokenType.DoubleColon) {
                    //then this is a composite type instead
                    return this.parseCompositeType()
                }

                return new ScalarTypeNode(this.digest(token.tokenType))

            case TokenType.HashSymbol:
                this.shouldBe(TokenType.HashSymbol)
                return new HandlePointerValue(this.parseType())

            case TokenType.Backtick:
                this.shouldBe(TokenType.Backtick)
                return new ReferenceValue(this.parseType())

            case TokenType.DollarSign:
                this.shouldBe(TokenType.DollarSign)
                return new ViewPointerValue(this.parseType())

            case TokenType.LSquareBrace:
                this.shouldBe(TokenType.LSquareBrace)
                let type_ = this.parseType()
                this.shouldBe(TokenType.RSquareBrace)
                return new PointerValue(type_)

            default:
                throw new Error(`Unrecognized Type ${this.getTokenTypeName(token.tokenType)}`)
        }

    }
}