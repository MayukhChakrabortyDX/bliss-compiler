import { TokenType } from "../../tokenizer/tokens";
import { NodeType, Node } from "../globalAst";
import { PanicNode } from "../helper";
import type { Parser } from "../parser";
import { Identifier } from "./node";

export class Allocator extends Node {
    constructor(public name: Node, public functions: Node[]) {
        super(NodeType.Allocator)
    }
}

export function parseAllocator(parser: Parser): Node {

    if ( parser.shouldBe(TokenType.K_Allocator) ) return new PanicNode();
    const name = new Identifier(parser.digest(TokenType.Identifier))
    if ( parser.shouldBe(TokenType.LBracket) ) return new PanicNode();

    const functions: Node[] = []

    while( parser.peek().tokenType != TokenType.RBracket ) {

        functions.push(
            //we parse function. //still not defined
            parser.parseFunction()
        )

    }

    if ( parser.shouldBe(TokenType.RBracket) ) return new PanicNode();

    return new Allocator(name, functions)

}