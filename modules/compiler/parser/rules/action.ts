import { Token, TokenType } from "../../tokenizer/tokens";
import { ActionNode, type FunctionDefinitionNode } from "../ast";
import { ParseFunction } from "./function";

export class ParseAction extends ParseFunction {

    parseAction() {

        this.shouldBe(TokenType.K_Action)
        let variableName: string = this.digest(TokenType.Identifier)

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