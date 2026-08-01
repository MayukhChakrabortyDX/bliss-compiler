import { TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import type { Parser } from "../parser";
import { EmptyNode, Identifier } from "./node";

export class Loop extends Node {

    constructor(public name: Node, public body: Node) {
        super(NodeType.Loop)
    }

}

export function decideBody(parser: Parser): Node {

    let branches = [
        parser.parseStructure,
        () => {

            const node = parser.parseNode();
            parser.shouldBe(TokenType.Semicolon)
            return node

        }
    ]

    for (let caller of branches) {

        const branch = parser.branchMode(() => caller())
        if (branch.status == false) {
            return branch.expr
        }

    }

    return new EmptyNode();


}

export function parseLoop(parser: Parser): Node {

    parser.shouldBe(TokenType.K_Loop)
    let name = new EmptyNode()

    if (parser.peek().tokenType == TokenType.Identifier) {

        name = new Identifier(parser.digest(TokenType.Identifier))

    }

    parser.shouldBe(TokenType.LBracket)
    const body = parser.parseBody()

    parser.shouldBe(TokenType.RBracket)

    return new Loop(name, body)

}