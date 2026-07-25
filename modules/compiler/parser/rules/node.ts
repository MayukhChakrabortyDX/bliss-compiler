import { Token, TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import type { Parser } from "../parser";

export class Identifier extends Node {
    constructor(public identifier: string) {
        super(NodeType.Identifier)
    }
}

export class Integer extends Node {
    constructor(public number: string) {
        super(NodeType.Integer)
    }
}

export class StringNode extends Node {
    constructor(public str: string) {
        super(NodeType.String)
    }
}

export class Reference extends Node {
    constructor(public atom: Node) {
        super(NodeType.Reference)
    }
}

export enum UnaryOperationEnum {
    AddressOf, SizeOf
}

export class UnaryOperation extends Node {
    constructor(public operation: UnaryOperationEnum, public atom: Node) {
        super(NodeType.UnaryOperation)
    }
}

export enum BinaryOperationEnum {
    PointerAccess, HandleAccess, ArrayAccess, Binding, MagneticAccess, MemberAccess,
    Multiply, Divide, Add, Subtract,
    LessThan, GreaterThan, LessThanEqual, GreaterThanEqual,
    Equals, NotEquals,
    Assignment
}

export class BinaryOperation extends Node {
    constructor(public operation: BinaryOperationEnum, public left: Node, public right: Node) {
        super(NodeType.BinaryOperation)
    }
}

export class EmptyNode extends Node {
    constructor() {
        super(NodeType.EmptyNode)
    }
}

export function parseAtom(parser: Parser): Node {

    const token = parser.peek()
    switch (token.tokenType) {

        case TokenType.Identifier:
            const IdentifierNode = new Identifier(
                parser.source.str.substring(
                    token.span.startIndex,
                    token.span.endIndex + 1
                )
            )

            parser.advance()
            return IdentifierNode

        case TokenType.Integer:
            const IntegerNode = new Integer(
                parser.source.str.substring(
                    token.span.startIndex,
                    token.span.endIndex + 1
                )
            )

            parser.advance()
            return IntegerNode

        case TokenType.String:
            const StrNode = new StringNode(
                parser.source.str.substring(
                    token.span.startIndex,
                    token.span.endIndex + 1
                )
            )

            parser.advance()
            return StrNode

        case TokenType.LBrace:
            parser.shouldBe(TokenType.LBrace)
            const NodeInBraces = parser.parseNode()
            parser.shouldBe(TokenType.RBrace)
            return NodeInBraces

        case TokenType.LSquareBrace:
            parser.shouldBe(TokenType.LSquareBrace)
            const PointerAccess = parser.parseNode()

            if (parser.peek().tokenType == TokenType.StraightBar) {

                parser.shouldBe(TokenType.StraightBar)
                const PointerIndex = parser.parseNode()
                parser.shouldBe(TokenType.RSquareBrace)

                parser.advance()
                return new BinaryOperation(
                    BinaryOperationEnum.PointerAccess,
                    PointerAccess,
                    PointerIndex
                )

            }

            parser.shouldBe(TokenType.RSquareBrace)

            parser.advance()
            return new BinaryOperation(
                BinaryOperationEnum.PointerAccess,
                PointerAccess,
                new EmptyNode()
            )

        case TokenType.HashSymbol:
            parser.shouldBe(TokenType.HashSymbol)
            parser.shouldBe(TokenType.LSquareBrace)

            const HandleAccess = parser.parseNode()

            if (parser.peek().tokenType == TokenType.StraightBar) {

                parser.shouldBe(TokenType.StraightBar)
                const HandleIndex = parser.parseNode()
                parser.shouldBe(TokenType.RSquareBrace)

                parser.advance()
                return new BinaryOperation(
                    BinaryOperationEnum.HandleAccess,
                    HandleAccess,
                    HandleIndex
                )

            }

            parser.shouldBe(TokenType.RSquareBrace)

            parser.advance()
            return new BinaryOperation(
                BinaryOperationEnum.HandleAccess,
                HandleAccess,
                new EmptyNode()
            )

        case TokenType.Backtick:
            parser.shouldBe(TokenType.Backtick)
            const ReferenceNode = parser.parseAtom()
            return new Reference(ReferenceNode)

        case TokenType.K_Adrs:
            parser.shouldBe(TokenType.K_Adrs)
            const AddressOf = parser.parseAtom()
            return new UnaryOperation(UnaryOperationEnum.AddressOf, AddressOf)

        case TokenType.K_Sizeof:
            parser.shouldBe(TokenType.K_Sizeof)
            const SizeOf = parser.parseAtom()
            return new UnaryOperation(UnaryOperationEnum.SizeOf, SizeOf);

    }

    parser.advance()
    return new EmptyNode() //the nothing denoter.

}

export function parseArray(atom: Node, parser: Parser): Node {

    if (parser.peek().tokenType == TokenType.LSquareBrace) {

        parser.shouldBe(TokenType.LSquareBrace)
        const index = parser.parseAtom()
        parser.shouldBe(TokenType.RSquareBrace)

        parser.advance()
        return new BinaryOperation(
            BinaryOperationEnum.ArrayAccess,
            atom,
            index
        )

    }

    return atom

}

export class CallList extends Node {

    constructor(public args: Node[]) {
        super(NodeType.CallList)
    }

}

export function parseCall(atom: Node, parser: Parser): Node {

    if (parser.peek().tokenType == TokenType.LBrace) {

        const argumentList: Node[] = []
        parser.shouldBe(TokenType.LBrace)

        while (true) {

            argumentList.push(parser.parseAtom())

            if (parser.peek().tokenType != TokenType.RBrace) {
                parser.shouldBe(TokenType.Comma)
            } else {
                parser.shouldBe(TokenType.RBrace)
                break
            }

        }

        parser.advance()
        return new CallList(argumentList)

    }

    return atom
}

export function decideCallOrArray(parser: Parser): Node {

    const atom = parser.parseAtom();

    if (parser.peek().tokenType == TokenType.LBrace) {

        return parser.parseCall(atom)

    }

    if (parser.peek().tokenType == TokenType.LSquareBrace) {

        return parser.parseArray(atom)

    }

    return atom

}

//! TASK - Make this code readable, this is very poorly written.
export function parseLeftAssociativeOperator(
    support: () => Node,
    operators: Map<TokenType, (left: Node, right: Node) => Node>,
    parser: Parser,
    limit: null | number = null,
): Node {

    const left = support();

    if (left.type == NodeType.EmptyNode) return left

    //if not, let's see where we can go.
    let finalExpr: Node = left;

    //optimize
    const operatorExist = () => parser.peek() as Token;
    let generator = (operators.get(operatorExist().tokenType) as (left: Node, right: Node) => Node)

    let count = 0;
    while (operators.has(operatorExist().tokenType) && (limit == null ? true : count < limit)) {
        generator = (operators.get(operatorExist().tokenType) as (left: Node, right: Node) => Node)
        parser.consume(1)
        //while this is true
        let right = support();

        if (right != null) {

            finalExpr = generator(finalExpr, right);

        } else {

            parser.logTokenError(parser.peek(), `Unexpected token ${parser.getTokenTypeName(parser.peek().tokenType)}. Expected an Expression instead`)
            process.exit(1)

        }

        count++;
    }

    return finalExpr;

}

//it basically helps
export function parseBinaryOperator(generator: () => Node, parser: Parser) {

    const returnObject = {

        operator: new Map<TokenType, (left: Node, right: Node) => Node>,

        addOperator(ttype: TokenType, node: (left: Node, right: Node) => Node) {

            this.operator.set(ttype, node)
            return this

        },

        parse(limit: number | null = null) {
            return parser.parseLeftAssociativeOperator(
                generator, this.operator, limit
            )
        }

    }

    return returnObject

}

export function parseBinding(parser: Parser): Node {

    return parser.parseBinaryOperator(() => parser.decideCallOrArray())
        .addOperator(
            TokenType.DoubleColon,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.Binding, left, right)
        )
        .parse()

}

export function parserMagnetic(parser: Parser): Node {

    return parser.parseBinaryOperator(() => parser.parseBinding())
        .addOperator(
            TokenType.ArrowRight,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.MagneticAccess, left, right)
        )
        .parse()

}

export function parseAccess(parser: Parser): Node {

    return parser.parseBinaryOperator(() => parser.parseMagnetic())
        .addOperator(
            TokenType.Dot,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.MemberAccess, left, right)
        )
        .parse()

}

export function parseProduct(parser: Parser): Node {

    return parser.parseBinaryOperator(() => parser.parseAccess())

        .addOperator(
            TokenType.Multiply,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.Multiply, left, right)
        )

        .addOperator(
            TokenType.Divide,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.Divide, left, right)
        )

        .parse()

}

export function parseSum(parser: Parser): Node {

    return parser.parseBinaryOperator(() => parser.parseProduct())

        .addOperator(
            TokenType.Add,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.Add, left, right)
        )

        .addOperator(
            TokenType.Minus,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.Subtract, left, right)
        )

        .parse()

}

export function parseInequality(parser: Parser): Node {

    return parser.parseBinaryOperator(() => parser.parseSum())

        .addOperator(
            TokenType.LessThan,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.LessThan, left, right)

        )
        .addOperator(
            TokenType.LessThanEqual,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.LessThanEqual, left, right)

        ).addOperator(
            TokenType.GreaterThan,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.GreaterThan, left, right)

        ).addOperator(
            TokenType.GreaterThanEqual,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.GreaterThanEqual, left, right)

        )
        .parse()

}

export function parseEquality(parser: Parser): Node {

    return parser.parseBinaryOperator(() => parser.parseInequality())

        .addOperator(
            TokenType.Compare,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.Equals, left, right)
        )

        .addOperator(
            TokenType.NotEqual,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.NotEquals, left, right)
        )

        .parse()

}

export function parseAssignment(parser: Parser): Node {

    return parser.parseBinaryOperator(() => parser.parseEquality())

        .addOperator(
            TokenType.Assignment,
            (left: Node, right: Node) =>
                new BinaryOperation(BinaryOperationEnum.Assignment, left, right)
        )

        .parse()


}

export function parseNode(parser: Parser): Node {

    return parser.parseAtom()

}