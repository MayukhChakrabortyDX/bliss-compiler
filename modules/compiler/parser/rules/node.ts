import { Token, TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import { PanicNode } from "../helper";
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
            if ( parser.shouldBe(TokenType.LBrace) ) return new PanicNode();
            const NodeInBraces = parser.parseNode()
            if ( parser.shouldBe(TokenType.RBrace) ) return new PanicNode();
            return NodeInBraces

        case TokenType.LSquareBrace:
            if ( parser.shouldBe(TokenType.LSquareBrace) ) return new PanicNode();
            const PointerAccess = parser.parseNode()

            if (parser.peek().tokenType == TokenType.StraightBar) {

                if ( parser.shouldBe(TokenType.StraightBar) ) return new PanicNode();
                const PointerIndex = parser.parseNode()
                if ( parser.shouldBe(TokenType.RSquareBrace) ) return new PanicNode();

                parser.advance()
                return new BinaryOperation(
                    BinaryOperationEnum.PointerAccess,
                    PointerAccess,
                    PointerIndex
                )

            }

            if ( parser.shouldBe(TokenType.RSquareBrace) ) return new PanicNode();

            parser.advance()
            return new BinaryOperation(
                BinaryOperationEnum.PointerAccess,
                PointerAccess,
                new EmptyNode()
            )

        case TokenType.HashSymbol:
            if ( parser.shouldBe(TokenType.HashSymbol) ) return new PanicNode();
            if ( parser.shouldBe(TokenType.LSquareBrace) ) return new PanicNode();

            const HandleAccess = parser.parseNode()

            if (parser.peek().tokenType == TokenType.StraightBar) {

                if ( parser.shouldBe(TokenType.StraightBar) ) return new PanicNode();
                const HandleIndex = parser.parseNode()
                if ( parser.shouldBe(TokenType.RSquareBrace) ) return new PanicNode();

                parser.advance()
                return new BinaryOperation(
                    BinaryOperationEnum.HandleAccess,
                    HandleAccess,
                    HandleIndex
                )

            }

            if ( parser.shouldBe(TokenType.RSquareBrace) ) return new PanicNode();

            parser.advance()
            return new BinaryOperation(
                BinaryOperationEnum.HandleAccess,
                HandleAccess,
                new EmptyNode()
            )

        case TokenType.Backtick:
            if ( parser.shouldBe(TokenType.Backtick) ) return new PanicNode();
            const ReferenceNode = parser.parseAtom()
            return new Reference(ReferenceNode)

        case TokenType.K_Adrs:
            if ( parser.shouldBe(TokenType.K_Adrs) ) return new PanicNode();
            const AddressOf = parser.parseAtom()
            return new UnaryOperation(UnaryOperationEnum.AddressOf, AddressOf)

        case TokenType.K_Sizeof:
            if ( parser.shouldBe(TokenType.K_Sizeof) ) return new PanicNode();
            const SizeOf = parser.parseAtom()
            return new UnaryOperation(UnaryOperationEnum.SizeOf, SizeOf);

    }
    
    parser.panic(parser.peek(), "No expression found")
    return new EmptyNode() //the nothing denoter.

}

export function parseArray(atom: Node, parser: Parser): Node {

    if (parser.peek().tokenType == TokenType.LSquareBrace) {

        if ( parser.shouldBe(TokenType.LSquareBrace) ) return new PanicNode();
        const index = parser.parseAtom()
        if ( parser.shouldBe(TokenType.RSquareBrace) ) return new PanicNode();

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
        if ( parser.shouldBe(TokenType.LBrace) ) return new PanicNode();

        while (true) {

            argumentList.push(parser.parseAtom())

            if (parser.peek().tokenType != TokenType.RBrace) {
                if ( parser.shouldBe(TokenType.Comma) ) return new PanicNode();
            } else {
                if ( parser.shouldBe(TokenType.RBrace) ) return new PanicNode();
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

    if ( parser.shouldBe(TokenType.K_Return) ) return new PanicNode();

    if (parser.peek().tokenType == TokenType.Semicolon) {

        if ( parser.shouldBe(TokenType.Semicolon) ) return new PanicNode();
        return new UnaryOperation(UnaryOperationEnum.Return, new EmptyNode())

    }

    const expr = parser.parseAssignment()
    if ( parser.shouldBe(TokenType.Semicolon) ) return new PanicNode();

    return new UnaryOperation(UnaryOperationEnum.Return, expr)

}

export function parseBreakStatement(parser: Parser): Node {

    if ( parser.shouldBe(TokenType.K_Break) ) return new PanicNode();

    if (parser.peek().tokenType == TokenType.Semicolon) {

        if ( parser.shouldBe(TokenType.Semicolon) ) return new PanicNode();
        return new UnaryOperation(UnaryOperationEnum.Break, new EmptyNode())

    }

    const expr = parser.parseAssignment()
    if ( parser.shouldBe(TokenType.Semicolon) ) return new PanicNode();

    return new UnaryOperation(UnaryOperationEnum.Break, expr)

}

export function parseLet(parser: Parser) : Node {

    let modifiers: Node[] = []

    while( parser.peek().tokenType != TokenType.K_Let ) {
        modifiers.push(
            parser.parseModifier()
        )
    }

    if ( parser.shouldBe(TokenType.K_Let) ) return new PanicNode();
    
    const variableName = new Identifier(parser.digest(TokenType.Identifier))
    if ( parser.shouldBe(TokenType.Colon) ) return new PanicNode();
    
    const type = parser.parseType()
    if ( parser.shouldBe(TokenType.Assignment) ) return new PanicNode();

    const expression = parser.parseNode()
    if ( parser.shouldBe(TokenType.Semicolon) ) return new PanicNode();

    return new LetNode(
        modifiers, variableName, type, expression
    )

}

export function parseTransform(parser: Parser): Node {

    if ( parser.shouldBe(TokenType.K_Transform) ) return new PanicNode();
    const expression = parser.parseNode()
    if ( parser.shouldBe(TokenType.K_To) ) return new PanicNode();
    const name = new Identifier(parser.digest(TokenType.Identifier))
    if ( parser.shouldBe(TokenType.Colon) ) return new PanicNode();
    const type = parser.parseType()
    if ( parser.shouldBe(TokenType.Semicolon) ) return new PanicNode();

    return new TransformNode(expression, type, name)

}

export function parseSubstitution(parser: Parser): Node {

    if ( parser.shouldBe(TokenType.K_Sub) ) return new PanicNode();
    const expr = parser.parseNode()
    if ( parser.shouldBe(TokenType.K_With) ) return new PanicNode();
    const name = new Identifier(parser.digest(TokenType.Identifier))
    if ( parser.shouldBe(TokenType.Semicolon) ) return new PanicNode();

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

    if ( parser.shouldBe(TokenType.K_New) ) return new PanicNode();
    if ( parser.shouldBe(TokenType.LessThan) ) return new PanicNode();
    const allocatorName = parser.digest(TokenType.Identifier);
    if ( parser.shouldBe(TokenType.GreaterThan) ) return new PanicNode();
    const expr = parser.parseAssignment();
    if ( parser.shouldBe(TokenType.Semicolon) ) return new PanicNode();

    return new BinaryOperation(
        BinaryOperationEnum.Allocate,
        new Identifier(allocatorName), expr
    )

}

export function parseFree(parser: Parser): Node {

    if ( parser.shouldBe(TokenType.K_Free) ) return new PanicNode();
    if ( parser.shouldBe(TokenType.LessThan) ) return new PanicNode();
    const allocatorName = parser.digest(TokenType.Identifier);
    if ( parser.shouldBe(TokenType.GreaterThan) ) return new PanicNode();
    const expr = parser.parseAssignment();
    if ( parser.shouldBe(TokenType.Semicolon) ) return new PanicNode();

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
        () => parser.decideAllocator(),
        () => parser.decideStatement(),
    ]

    return parser.useBranch(nodes, "Invalid Node Structure")

}