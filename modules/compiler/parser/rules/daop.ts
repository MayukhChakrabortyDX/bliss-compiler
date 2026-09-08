import { TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import { PanicNode } from "../helper";
import type { Parser } from "../parser";
import { BinaryOperation, BinaryOperationEnum, EmptyNode, Identifier } from "./node";

export function parseAlias(parser: Parser): Node {

    if ( parser.shouldBe(TokenType.K_Alias) ) return new PanicNode();
    const type = parser.parseType()
    if ( parser.shouldBe(TokenType.K_As) ) return new PanicNode();
    const name = new Identifier(parser.digest(TokenType.Identifier))
    if ( parser.shouldBe(TokenType.Semicolon) ) return new PanicNode();

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

    if ( parser.shouldBe(TokenType.K_Action) ) return new PanicNode();
    const name = new Identifier(parser.digest(TokenType.Identifier))

    if ( parser.shouldBe(TokenType.LBracket) ) return new PanicNode();

    const actionBody: Node[] = []

    while (parser.peek().tokenType != TokenType.RBracket) {

        actionBody.push(
            parser.parseFunctionHead()
        )

        if ( parser.shouldBe(TokenType.Semicolon) ) return new PanicNode();

    }

    if ( parser.shouldBe(TokenType.RBracket) ) return new PanicNode();

    return new Action(name, actionBody)

}

export class Bind extends Node {

    constructor( public dataName: Node, public actions: Node[], public bindingName: Node, public functions: Node[] ) {

        super(NodeType.BindingNode)

    }

}

export function parseBind(parser: Parser): Node {

    if ( parser.shouldBe(TokenType.K_Bind) ) return new PanicNode();
    const dataName = new Identifier(parser.digest(TokenType.Identifier))
    if ( parser.shouldBe(TokenType.K_With) ) return new PanicNode();

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

        if ( parser.shouldBe(TokenType.LBrace) ) return new PanicNode();

        while (true) {

            actions.push(
                new Identifier(
                    parser.digest(TokenType.Identifier)
                )
            )

            if ( parser.peek().tokenType == TokenType.RBrace ) {
                if ( parser.shouldBe(TokenType.RBrace) ) return new PanicNode();
                return
            }

            if ( parser.shouldBe(TokenType.Comma) ) return new PanicNode();

        }

    })

    if ( parser.shouldBe(TokenType.K_As) ) return new PanicNode();
    const bindingName = new Identifier(parser.digest(TokenType.Identifier))

    if ( parser.shouldBe(TokenType.LBracket) ) return new PanicNode();

    const functions: Node[] = []

    while( parser.peek().tokenType != TokenType.RBracket ) {

        functions.push(
            parser.parseFunction()
        )

    }

    if ( parser.shouldBe(TokenType.RBracket) ) return new PanicNode();
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