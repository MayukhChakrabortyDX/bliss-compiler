import { TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import { PanicNode } from "../helper";
import { Parser } from "../parser";
import { EmptyNode } from "./node";

export class If extends Node {

    constructor(public condition: Node, public body: Node) {
        super(NodeType.If)
    }

}

export class Elif extends Node {

    constructor(public condition: Node, public body: Node) {
        super(NodeType.Elif)
    }

}

export class Else extends Node {

    constructor(public body: Node) {
        super(NodeType.Else)
    }

}

export class Condition extends Node {

    constructor(public If: Node, public Elif: Node[], public Else: Node) {
        
        super(NodeType.Condition)

    }

}

function parseIf(parser: Parser): Node {

    if ( parser.shouldBe(TokenType.K_If) ) return new PanicNode();
    if ( parser.shouldBe(TokenType.LBrace) ) return new PanicNode();

    const condition: Node = parser.parseNode()

    if ( parser.shouldBe(TokenType.RBrace) ) return new PanicNode();

    const body = parser.parseBody()

    return new If(condition, body)

}

function parseElif(parser: Parser): Node {

    if ( parser.shouldBe(TokenType.K_Elif) ) return new PanicNode();
    if ( parser.shouldBe(TokenType.LBrace) ) return new PanicNode();

    const condition: Node = parser.parseNode()

    if ( parser.shouldBe(TokenType.RBrace) ) return new PanicNode();

    const body = parser.parseBody()

    return new Elif(condition, body)
}

function parseElse(parser: Parser): Node {

    
    if ( parser.shouldBe(TokenType.K_Else) ) return new PanicNode();
    const body = parser.parseBody()
    return new Else(body)

}

export function parseCondition(parser: Parser): Node {

    const ifNode = parseIf(parser)

    const elifNodes: Node[] = []

    while ( parser.peek().tokenType == TokenType.K_Elif ) {

        elifNodes.push(
            parseElif(parser)
        )

    }

    if ( parser.peek().tokenType == TokenType.K_Else ) {

        const elseNode = parseElse(parser)
        return new Condition(ifNode, elifNodes, elseNode)

    }

    return new Condition(ifNode, elifNodes, new EmptyNode())

}