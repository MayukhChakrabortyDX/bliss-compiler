import { Token, TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import { type FunctionDefinitionNode } from './function'
import { ParseAction } from "./action";

export class BindingNode extends Node {
    constructor(public dataName: string, public bindingName: string, public actionNames: string[], public functionDefinitions: FunctionDefinitionNode[]) {
        super(NodeType.BindingNode)
    }
}

export class ParseBinds extends ParseAction {

    parseBinding() {

        const finish = this.start()
        this.shouldBe(TokenType.K_Bind)

        let variableName: string = this.digest(TokenType.Identifier)

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
                this.advance()
                actionNames.push(this.digest(TokenType.Identifier))

                while ((this.peek(0) as Token).tokenType != TokenType.RBrace) {

                    this.shouldBe(TokenType.Comma)
                    actionNames.push(this.digest(TokenType.Identifier))

                }
                
                this.shouldBe(TokenType.RBrace)
                break

        }

        this.shouldBe(TokenType.K_As)

        let bindedAs: string = this.digest(TokenType.Identifier)

        this.shouldBe(TokenType.LBracket)

        const functionBody: FunctionDefinitionNode[] = []
        functionBody.push(this.parseFunctionDefinition())

        while ((this.peek(0) as Token).tokenType == TokenType.K_Fx) {
            functionBody.push(this.parseFunctionDefinition())
        }

        this.shouldBe(TokenType.RBracket)

        return finish(new BindingNode(variableName, bindedAs, actionNames, functionBody))

    }

}