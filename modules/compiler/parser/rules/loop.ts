import { TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import { PanicNode } from "../helper";
import type { Parser } from "../parser";
import { EmptyNode, Identifier } from "./node";

export class Loop extends Node {

    constructor(public name: Node, public body: Node) {
        super(NodeType.Loop)
    }

}

export function decideBody(parser: Parser): Node {

    let branches = [
        () => parser.parseStructure(),
        () => {
            
            const node = parser.parseNode();
            if (parser.shouldBe(TokenType.Semicolon)) return new PanicNode();
            return node

        }
    ]

    return parser.useBranch(branches, "Invalid Body")

}

//* DONE with panic handling one one of the structures.
export function parseLoop(parser: Parser): Node {

    if (parser.shouldBe(TokenType.K_Loop)) return new PanicNode();

    let name = new EmptyNode()

    if (parser.peek().tokenType == TokenType.Identifier) {

        name = new Identifier(parser.digest(TokenType.Identifier))

    }

    if (parser.shouldBe(TokenType.LBracket)) return new PanicNode();

    const body = parser.parseBody()

    if (parser.shouldBe(TokenType.RBracket)) return new PanicNode();

    return new Loop(name, body)

}