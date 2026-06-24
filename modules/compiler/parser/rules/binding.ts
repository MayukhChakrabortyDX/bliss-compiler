import { Token, TokenType } from "../../tokens";
import { BindingNode, type FunctionDefinitionNode } from "../ast";
import { ParseAction } from "./action";

export class ParseBinds extends ParseAction {

        parseBinding() {
    
            this.shouldBe(TokenType.K_Bind)
    
            let variableName: string = ""
            this.expect(this.peek(0) as Token, TokenType.Identifier, () => {
    
                const token = this.peek(0) as Token
                variableName = this.source.str.substring(token.span.startIndex, token.span.endIndex + 1)
                this.advance()
    
            })
    
            this.shouldBe(TokenType.K_With)
    
            const actionNames: string[] = [];
            const _token = this.peek(0) as Token
            switch (_token.tokenType) {
    
                case TokenType.Identifier:
                    actionNames.push(
                        this.source.str.substring(
                            _token.span.startIndex,
                            _token.span.endIndex + 1
                        )
                    )
                    this.advance()
                    break
    
                case TokenType.LBrace:
                    while ((this.peek(0) as Token).tokenType != TokenType.RBrace) {
                        const __token = this.peek(0) as Token
                        actionNames.push(
                            this.source.str.substring(
                                __token.span.startIndex,
                                __token.span.endIndex + 1
                            )
                        )
                        this.consume(2)
                    }
    
                    this.shouldBe(TokenType.RBrace)
                    break
    
            }
    
            this.shouldBe(TokenType.K_As)
    
            let bindedAs: string = ""
            this.expect(this.peek(0) as Token, TokenType.Identifier, () => {
    
                const token = this.peek(0) as Token
                bindedAs = this.source.str.substring(token.span.startIndex, token.span.endIndex + 1)
                this.advance()
    
            })
    
            this.shouldBe(TokenType.LBracket)
    
            const functionBody: FunctionDefinitionNode[] = []
            functionBody.push(this.parseFunctionDefinition())
    
            while ((this.peek(0) as Token).tokenType == TokenType.K_Fx) {
                functionBody.push(this.parseFunctionDefinition())
            }
    
            this.shouldBe(TokenType.RBracket)
    
            return new BindingNode(variableName, bindedAs, actionNames, functionBody)
    
        }

}