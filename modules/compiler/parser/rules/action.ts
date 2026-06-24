import { Token, TokenType } from "../../tokens";
import { ActionNode, type FunctionDefinitionNode } from "../ast";
import { ParseFunction } from "./function";

export class ParseAction extends ParseFunction {

    parseAction() {

        this.shouldBe(TokenType.K_Action)
        let variableName: string = ""
        this.expect(this.peek(0) as Token, TokenType.Identifier, () => {

            const token = this.peek(0) as Token
            variableName = this.source.str.substring(token.span.startIndex, token.span.endIndex + 1)
            this.advance()

        })

        this.shouldBe(TokenType.LBracket)

        const body: FunctionDefinitionNode[] = []

        body.push(this.parseReducedFunction())

        while ((this.peek(0) as Token).tokenType == TokenType.K_Fx) {
            body.push(this.parseReducedFunction())
        }

        this.shouldBe(TokenType.RBracket)

        return new ActionNode(variableName, body)

    }

}