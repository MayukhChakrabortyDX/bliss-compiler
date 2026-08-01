//helper functions are local to parsing functions

import { TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import type { Parser } from "../parser";
import { EmptyNode, Identifier } from "./node";

export class Function extends Node {
    constructor(public name: Node, public args: Node[], public returnType: Node, public body: Node = new EmptyNode()) {
        super(NodeType.Function)
    }
}

export class ActionArgument extends Node {

    constructor(public actions: Node[], public name: Node = new EmptyNode()) {
        super(NodeType.ActionBasedArgument)
    }

}

export class TypedArgument extends Node {

    constructor(public dataType: Node, public name: Node) {
        super(NodeType.TypeBasedArgument)
    }

}

export class CompositeArgument extends Node {

    constructor(public typedArgument: Node, public actionArgument: Node) {
        super(NodeType.CompositeType)
    }

}

export class Body extends Node {

    constructor(public nodes: Node[]) {
        super(NodeType.Body)
    }

}

function parseAction(parser: Parser): Node {

    parser.shouldBe(TokenType.K_With)
    if (parser.peek().tokenType == TokenType.LBrace) {

        const names: Node[] = []

        parser.shouldBe(TokenType.LBrace)
        while (true) {

            names.push(
                new Identifier(parser.digest(TokenType.Identifier))
            )

            if (parser.peek().tokenType == TokenType.RBrace) {
                parser.shouldBe(TokenType.RBrace)
                break;
            } else {
                parser.shouldBe(TokenType.Comma)
            }

        }

        return new ActionArgument(names)

    }

    const name = parser.digest(TokenType.Identifier)
    return new ActionArgument([new Identifier(name)])

}

function parseTyped(parser: Parser): Node {

    const type = parser.parseType()
    const name = parser.digest(TokenType.Identifier)

    return new TypedArgument(type, new Identifier(name))

}

function parseCompositeType(parser: Parser): Node {

    const typed = parseTyped(parser)
    const action = parseAction(parser)

    return new CompositeArgument(typed, action)

}

function parseArgument(parser: Parser): Node {

    let branches = [
        () => parseCompositeType(parser),
        () => parseTyped(parser),
        () => {

            const identifier = parser.digest(TokenType.Identifier)
            const action: ActionArgument = parseAction(parser) as ActionArgument

            action.name = new Identifier(identifier)

            return action

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

export function parseFunctionHead(parser: Parser): Node {

    parser.shouldBe(TokenType.K_Fx)
    const name = parser.digest(TokenType.Identifier)
    parser.shouldBe(TokenType.LBrace)

    const args: Node[] = []

    while (true) {

        args.push(
            parseArgument(parser)
        )

        if (parser.peek().tokenType == TokenType.RBrace) {
            parser.shouldBe(TokenType.RBrace)
            break
        } else {
            parser.shouldBe(TokenType.Comma)
        }

    }

    parser.shouldBe(TokenType.Colon)
    const returnType = parser.parseType();

    return new Function(new Identifier(name), args, returnType)

}

export function parseBody(parser: Parser): Node {

    parser.shouldBe(TokenType.LBracket)
    const body: Node[] = []

    while (parser.peek().tokenType != TokenType.RBracket) {

        body.push(
            parser.decideBody()
        )

    }

    return new Body(body)

}

export function parseFunction(parser: Parser): Node {

    const head = parseFunctionHead(parser)
    const body = parser.parseBody();

    (head as Function).body = body

    return head

}