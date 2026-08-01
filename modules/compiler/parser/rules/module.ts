import { TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import type { Parser } from "../parser";
import { EmptyNode } from "./node";

export enum ModuleKind {
    Import, Using
}

export class Module extends Node {
    constructor(public kind: ModuleKind, public accessor: Node) {
        super(NodeType.Module)
    }
}

export function parseModule(parser: Parser): Node {

    switch(parser.peek().tokenType) {
        case TokenType.K_Import:
            parser.advance()
            const importPath = parser.parseAccess();
            parser.shouldBe(TokenType.Semicolon)
            return new Module(ModuleKind.Import, importPath)
        
        case TokenType.K_Using:
            parser.advance()
            const usingPath = parser.parseAccess()
            parser.shouldBe(TokenType.Semicolon)
            return new Module(ModuleKind.Using, usingPath)
    }

    parser.panic(parser.peek(), "Invalid token used for import");
    return new EmptyNode()

}