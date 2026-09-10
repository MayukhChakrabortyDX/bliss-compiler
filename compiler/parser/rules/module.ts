//we will use branching a lot today!

import { TokenType } from "../../lexer/tokens";
import { BinaryOperatorNode, BinaryOpsEnum, EmptyNode, Identifier, Node, NodeType } from "../ast";
import type { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";

//for parseModuleAtom, we need a branch table
const identifierBranch = createBranch((parser: Parser) => {

    const finish = parser.start()
    const name = parser.digest({
        expected: TokenType.Identifier,
        sync: new Set([TokenType.Identifier, TokenType.Dot, TokenType.LBrace, TokenType.EOF]),
        title: "Invalid entry in module name"
    })
    return finish(new Identifier(name))

}, TokenType.Identifier)

export class IncludePaths extends Node {
    constructor(public paths: Node[]) {
        super(NodeType.IncludePath)
    }
}

const bracketBranch = createBranch((parser: Parser) => {

    const finish = parser.start()
    parser.match({
        expected: TokenType.LBrace,
        sync: new Set([]),
        title: "This message should not even appear"
    })

    const paths: Node[] = []

    paths.push(
        parser.module.parseModulePath()
    )

    while (true) {

        if (parser.peek().tokenType != TokenType.RBrace) {
            parser.match({
                expected: TokenType.Comma,
                sync: new Set(),
                title: ""
            })
        } else {
            parser.advance()
            break;
        }

        paths.push(
            parser.module.parseModulePath()
        )

        if ( parser.isRecovery ) {
            break;
        }

    }

    return finish(new IncludePaths(paths))

}, TokenType.LBrace)

export class IncludeAllPath extends Node {
    constructor() {
        super(NodeType.IncludeAllPath)
    }
}

const includeAllBranch = createBranch((parser: Parser) => {

    const finish = parser.start()
    parser.match({
        expected: TokenType.Multiply,
        sync: new Set([]),
        title: "Invalid token I guess"
    })

    return finish(new IncludeAllPath())

}, TokenType.Multiply)

const group = branchGroup(identifierBranch, bracketBranch, includeAllBranch)

export function parseModuleAtom(parser: Parser) {

    const finish = parser.start()

    return finish(
        parser.useBranch(group, "Invalid import value", new Set([TokenType.Semicolon, TokenType.EOF, TokenType.Dot]))
    )
}

export function parseModulePath(parser: Parser) {

    const finish = parser.start()
    let left = parser.module.parseModuleAtom()

    if ( parser.peek().tokenType == TokenType.Dot ) {
        parser.advance()
        left = new BinaryOperatorNode(
            left, parseModulePath(parser), BinaryOpsEnum.IncludePath
        )
    }

    return finish(left)

}