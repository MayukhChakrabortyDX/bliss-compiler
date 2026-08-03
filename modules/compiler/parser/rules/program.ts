import { TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import type { Parser } from "../parser";

export class Program extends Node {

    constructor(public nodes: Node[]) {
        super(NodeType.Program)
    }

}

export function parseProgram(parser: Parser): Node {


    //this parses a program
    let nodes: Node[] = []
    const branches = [
        () => parser.parseModule(),
        () => parser.parseFunction(),
        () => parser.parseDAOP(),
        () => parser.parseAllocator()
    ]

    while (true) {

        const node = parser.useBranch(branches, "No valid structure matched.")

        if ( node.type == NodeType.EmptyNode ) {
            break
        }

        nodes.push(node)

        if ( parser.peek().tokenType == TokenType.EOF ) {
            break
        }

    }

    return new Program(nodes)

}