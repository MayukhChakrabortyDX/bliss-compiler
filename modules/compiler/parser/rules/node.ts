import { Token, TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import type { Parser } from "../parser";
import type { Modifier } from "./modifiers";

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
    AddressOf, SizeOf, Return, Break
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
    Assignment,
    Allocate, Free,
    Substitute,
    Alias
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

export class LetNode extends Node {
    constructor(public modifiers: Node[], public name: Node, public dataType: Node, public expression: Node) {
        super(NodeType.LetNode)
    }
}

export class TransformNode extends Node {
    constructor(public fromExpr: Node, public toType: Node, public withName: Node) {

        super(NodeType.TransformNode)

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

//------------------STATEMENT NODES------------------//

export function parseReturnStatement(parser: Parser): Node {

    parser.shouldBe(TokenType.K_Return);

    if (parser.peek().tokenType == TokenType.Semicolon) {

        parser.shouldBe(TokenType.Semicolon)
        return new UnaryOperation(UnaryOperationEnum.Return, new EmptyNode())

    }

    const expr = parser.parseAssignment()
    parser.shouldBe(TokenType.Semicolon)

    return new UnaryOperation(UnaryOperationEnum.Return, expr)

}

export function parseBreakStatement(parser: Parser): Node {

    parser.shouldBe(TokenType.K_Break);

    if (parser.peek().tokenType == TokenType.Semicolon) {

        parser.shouldBe(TokenType.Semicolon)
        return new UnaryOperation(UnaryOperationEnum.Break, new EmptyNode())

    }

    const expr = parser.parseAssignment()
    parser.shouldBe(TokenType.Semicolon)

    return new UnaryOperation(UnaryOperationEnum.Break, expr)

}

export function parseLet(parser: Parser) : Node {

    let modifiers: Node[] = []

    while( parser.peek().tokenType != TokenType.K_Let ) {
        modifiers.push(
            parser.parseModifier()
        )
    }

    parser.shouldBe(TokenType.K_Let)
    
    const variableName = new Identifier(parser.digest(TokenType.Identifier))
    parser.shouldBe(TokenType.Colon)
    
    const type = parser.parseType()
    parser.shouldBe(TokenType.Assignment)

    const expression = parser.parseNode()
    parser.shouldBe(TokenType.Semicolon)

    return new LetNode(
        modifiers, variableName, type, expression
    )

}

export function parseTransform(parser: Parser): Node {

    parser.shouldBe(TokenType.K_Transform)
    const expression = parser.parseNode()
    parser.shouldBe(TokenType.K_To)
    const name = new Identifier(parser.digest(TokenType.Identifier))
    parser.shouldBe(TokenType.Colon)
    const type = parser.parseType()
    parser.shouldBe(TokenType.Semicolon)

    return new TransformNode(expression, type, name)

}

export function parseSubstitution(parser: Parser): Node {

    parser.shouldBe(TokenType.K_Sub)
    const expr = parser.parseNode()
    parser.shouldBe(TokenType.K_With)
    const name = new Identifier(parser.digest(TokenType.Identifier))
    parser.shouldBe(TokenType.Semicolon)

    return new BinaryOperation(
        BinaryOperationEnum.Substitute,
        expr,
        name
    )

}

export function decideStatement(parser: Parser): Node {

    let statement = [
        () => parser.parseReturnStatement(),
        () => parser.parseBreakStatement(),
        () => parser.parseLet(),
        () => parser.parseTransform(),
        () => parser.parseSubstitution()
    ]

    return parser.useBranch(statement, "Invalid statement structure")

}

//------------------MEMORY ALLOCATION------------------//

export function parseNew(parser: Parser): Node {

    parser.shouldBe(TokenType.K_New);
    parser.shouldBe(TokenType.LessThan);
    const allocatorName = parser.digest(TokenType.Identifier);
    parser.shouldBe(TokenType.GreaterThan);
    const expr = parser.parseAssignment();
    parser.shouldBe(TokenType.Semicolon);

    return new BinaryOperation(
        BinaryOperationEnum.Allocate,
        new Identifier(allocatorName), expr
    )

}

export function parseFree(parser: Parser): Node {

    parser.shouldBe(TokenType.K_Free);
    parser.shouldBe(TokenType.LessThan);
    const allocatorName = parser.digest(TokenType.Identifier);
    parser.shouldBe(TokenType.GreaterThan);
    const expr = parser.parseAssignment();
    parser.shouldBe(TokenType.Semicolon);

    return new BinaryOperation(
        BinaryOperationEnum.Allocate,
        new Identifier(allocatorName), expr
    )

}

export function decideAllocator(parser: Parser): Node {

    if (parser.peek().tokenType == TokenType.K_New) {
        return parser.parseNew()
    }

    return parser.parseFree()

}

export function parseNode(parser: Parser): Node {

    let nodes = [
        () => parser.parseAssignment(),
        () => parser.decideStatement(),
        () => parser.decideAllocator(),
    ]

    return parser.useBranch(nodes, "Invalid Node Structure")

}