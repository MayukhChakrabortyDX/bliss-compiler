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

        if ( parser.peek().tokenType == TokenType.EOF ) {
            break
        }

        //console.log(JSON.stringify(nodes, undefined, 2))
        const node = parser.useBranch(branches, "No valid root structure matched.")

        if ( node.type == NodeType.EmptyNode || node.type == NodeType.Panic ) {
            break
        }

        nodes.push(node)

    }

    return new Program(nodes)

}