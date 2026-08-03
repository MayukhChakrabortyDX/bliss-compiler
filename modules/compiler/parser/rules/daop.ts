import { TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import type { Parser } from "../parser";
import { BinaryOperation, BinaryOperationEnum, EmptyNode, Identifier } from "./node";

export function parseAlias(parser: Parser): Node {

    parser.shouldBe(TokenType.K_Alias)
    const type = parser.parseType()
    parser.shouldBe(TokenType.K_As)
    const name = new Identifier(parser.digest(TokenType.Identifier))
    parser.shouldBe(TokenType.Semicolon)

    return new BinaryOperation(
        BinaryOperationEnum.Alias,
        type, name
    )

}

export class Action extends Node {

    constructor(public name: Node, public actionBody: Node[]) {
        super(NodeType.ActionNode)
    }

}

export function parseAction(parser: Parser): Node {

    parser.shouldBe(TokenType.K_Action)
    const name = new Identifier(parser.digest(TokenType.Identifier))

    parser.shouldBe(TokenType.LBracket)

    const actionBody: Node[] = []

    while (parser.peek().tokenType != TokenType.RBracket) {

        actionBody.push(
            parser.parseFunctionHead()
        )

        parser.shouldBe(TokenType.Semicolon)

    }

    parser.shouldBe(TokenType.RBracket)

    return new Action(name, actionBody)

}

export class Bind extends Node {

    constructor( public dataName: Node, public actions: Node[], public bindingName: Node, public functions: Node[] ) {

        super(NodeType.BindingNode)

    }

}

export function parseBind(parser: Parser): Node {

    parser.shouldBe(TokenType.K_Bind)
    const dataName = new Identifier(parser.digest(TokenType.Identifier))
    parser.shouldBe(TokenType.K_With)

    const actions: Node[] = []

    if (parser.peek().tokenType == TokenType.Identifier) {

        actions.push(
            new Identifier(
                parser.digest(TokenType.Identifier)
            )
        )

        parser.skipCallback("check-bracket-identifiers")

    }

    parser.useCallback("check-bracket-identifiers", () => {

        parser.shouldBe(TokenType.LBrace)

        while (true) {

            actions.push(
                new Identifier(
                    parser.digest(TokenType.Identifier)
                )
            )

            if ( parser.peek().tokenType == TokenType.RBrace ) {
                parser.shouldBe(TokenType.RBrace)
                return
            }

            parser.shouldBe(TokenType.Comma)

        }

    })

    parser.shouldBe(TokenType.K_As)
    const bindingName = new Identifier(parser.digest(TokenType.Identifier))

    parser.shouldBe(TokenType.LBracket)

    const functions: Node[] = []

    while( parser.peek().tokenType != TokenType.RBracket ) {

        functions.push(
            parser.parseFunction()
        )

    }

    parser.shouldBe(TokenType.RBracket)
    return new Bind( dataName, actions, bindingName, functions )

}

export function parseData(parser: Parser): Node {
    return new EmptyNode()
}

export function parseDAOP(parser: Parser): Node {

    let branches = [
        () => parser.parseAlias(),
        () => parser.parseAction(),
        //parser.parseData,
        () => parser.parseBind()
    ]

    return parser.useBranch(branches, "Invalid DAOP Condition used")

}