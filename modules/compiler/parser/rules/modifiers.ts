import { TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import type { Parser } from "../parser";
import { EmptyNode } from "./node";

enum ModifierEnum {
    unsafe, trans, volatile
}

export class Modifier extends Node {

    constructor(public modifier: ModifierEnum) {
        super(NodeType.Modifier)
    }

}

export function parseModifier(parser: Parser): Node {

    switch( parser.peek().tokenType ) {

        case TokenType.K_Unsafe:
            parser.shouldBe(TokenType.K_Unsafe)
            return new Modifier(ModifierEnum.unsafe)

        case TokenType.K_Trans:
            parser.shouldBe(TokenType.K_Trans)
            return new Modifier(ModifierEnum.trans)
        
        case TokenType.K_Volatile:
            parser.shouldBe(TokenType.K_Volatile)
            return new Modifier(ModifierEnum.volatile)

    }

    parser.panic(parser.peek(), "No modifier found")
    return new EmptyNode()

}