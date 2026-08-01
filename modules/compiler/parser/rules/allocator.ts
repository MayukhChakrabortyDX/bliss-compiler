import { TokenType } from "../../tokenizer/tokens";
import { NodeType, Node } from "../globalAst";
import type { Parser } from "../parser";
import { Identifier } from "./node";

export class Allocator extends Node {
    constructor(public name: Node, public functions: Node[]) {
        super(NodeType.Allocator)
    }
}

export function parseAllocator(parser: Parser): Node {

    parser.shouldBe(TokenType.K_Allocator)
    const name = new Identifier(parser.digest(TokenType.Identifier))
    parser.shouldBe(TokenType.LBracket)

    const functions: Node[] = []

    while( parser.peek().tokenType != TokenType.RBracket ) {

        functions.push(
            //we parse function. //still not defined
            parser.parseFunction()
        )

    }

    parser.shouldBe(TokenType.RBracket)

    return new Allocator(name, functions)

}