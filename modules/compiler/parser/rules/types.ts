import { Token, TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import type { Parser } from "../parser";
import { EmptyNode, Identifier, Integer } from "./node";

enum DataTypeEnum {
    builtin, composite, identifier,
    handle, pointer, reference, array
}

export class DataType extends Node {

    constructor(public dataType: DataTypeEnum, value: Node) {
        super(NodeType.DataType)
    }

}

export class TokenNode extends Node {

    constructor(public token: Token) {
        super(NodeType.TokenNode)
    }

}

export class BinaryRelation extends Node {

    constructor(public left: Node, public right: Node) {
        super(NodeType.BinaryRelation)
    }

}

export class ListOfNodes extends Node {

    constructor(public nodes: Node[]) {
        super(NodeType.ListOfNodes)
    }

}

export function parseBuiltinTypes(parser: Parser): Node {

    if (parser.builtinTypes.has(parser.peek().tokenType)) {

        return new DataType(DataTypeEnum.builtin, new TokenNode(parser.peek()))

    } else {

        return new EmptyNode()

    }

}

export function parseCompositeType(parser: Parser): Node {

    const expr = parser.parseNode();
    parser.shouldBe(TokenType.DoubleColon);

    if (parser.peek().tokenType == TokenType.Identifier) {

        return new DataType(
            DataTypeEnum.composite,
            new BinaryRelation(
                expr,
                new Identifier(
                    parser.digest(TokenType.Identifier)
                )
            )
        )

    }

    parser.shouldBe(TokenType.LBrace)
    const list = new ListOfNodes([])

    while (parser.peek().tokenType != TokenType.RBrace) {

        list.nodes.push(
            new Identifier(parser.digest(TokenType.Identifier))
        )

        if (parser.peek().tokenType == TokenType.RBrace) {

            parser.shouldBe(TokenType.RBrace)
            break

        }

        parser.shouldBe(TokenType.Comma)

    }

    return new DataType(
        DataTypeEnum.composite,
        new BinaryRelation(
            expr,
            list
        )
    )

}

export function parseIdentifierType(parser: Parser): Node {
    return new DataType(
        DataTypeEnum.identifier,
        new Identifier(
            parser.digest(TokenType.Identifier)
        )
    )
}

export function parseHandleType(parser: Parser): Node {

    parser.shouldBe(TokenType.HashSymbol)
    return new DataType(
        DataTypeEnum.handle, parser.parseType()
    )

}

export function parsePointerType(parser: Parser): Node {

    parser.shouldBe(TokenType.LSquareBrace)
    const type = parser.parseType()
    parser.shouldBe(TokenType.RSquareBrace)

    return new DataType(DataTypeEnum.pointer, type)

}

export function parseReferenceType(parser: Parser): Node {

    parser.shouldBe(TokenType.Backtick)
    const type = parser.parseType()

    return new DataType(DataTypeEnum.reference, type)

}

export function parseArrayType(parser: Parser): Node {

    const type = parser.parseType()
    parser.shouldBe(TokenType.LSquareBrace)
    const integer = parser.digest(TokenType.Integer)
    parser.shouldBe(TokenType.RSquareBrace)

    return new DataType(
        DataTypeEnum.array,
        new BinaryRelation(
            type, new Integer(integer)
        )
    )

}

export function parseType(parser: Parser): Node {

    let branches = [
        parser.parseBuiltinTypes,
        parser.parseCompositeType,
        parser.parseIdentifierType,
        parser.parseHandleType,
        parser.parsePointerType,
        parser.parseReferenceType,
        parser.parseArrayType,
    ]

    for (let caller of branches) {

        const branch = parser.branchMode(() => caller())
        if (branch.status == false) {
            return branch.expr
        }

    }

    return new EmptyNode();

}