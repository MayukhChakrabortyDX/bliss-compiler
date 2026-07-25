import { Token, TokenType } from "../../tokenizer/tokens";
import { type FunctionDefinitionNode } from "./function";
import { ParseFunction } from "./function";
import { Node, NodeType } from "../../parser/globalAst";
//asts are now being localized.

export class ActionNode extends Node {
    constructor(public name: string | null, public functions: FunctionDefinitionNode[]) {
        super(NodeType.ActionNode)
    }
}

export class ParseAction extends ParseFunction {

    parseAction() {

        const finish = this.start()
        this.shouldBe(TokenType.K_Action)
        let variableName: string = this.digest(TokenType.Identifier)

        this.shouldBe(TokenType.LBracket)

        const body: FunctionDefinitionNode[] = []

        body.push(this.parseReducedFunction())

        while ((this.peek(0) as Token).tokenType == TokenType.K_Fx) {
            body.push(this.parseReducedFunction())
        }

        this.shouldBe(TokenType.RBracket)

        return finish(new ActionNode(variableName, body))

    }

}