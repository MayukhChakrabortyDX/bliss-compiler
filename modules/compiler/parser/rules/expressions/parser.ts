import { Token, TokenType } from "../../../tokenizer/tokens";
import { IdentifierNode } from "../statements";
import { ParserBase } from "../../helper";

import {
    type Expression, Number,
    NumberNode, StringNode,
    PointerExpressionNode, HandlExpressionNode,
    ViewExpression, ReferenceExpressionNode,
    CallSignatureNode, BinaryOperation, BinaryOperatorNode,
    UnaryOperation,
    UnaryOperatorNode,
    CallSignature,
} from './ast'

export class ParseExpressions extends ParserBase {

    parseLeftAssociativeOperator(support: () => Expression, operators: Map<TokenType, (left: Expression, right: Expression) => Expression>, limit: null | number = null): Expression {

        const left = support();

        if (left == null) return null;

        //if not, let's see where we can go.
        let finalExpr: Expression = left;

        //optimize
        const operatorExist = () => this.peek(1) as Token;
        let generator = (operators.get(operatorExist().tokenType) as (left: Expression, right: Expression) => Expression)

        let count = 0;
        while (operators.has(operatorExist().tokenType) && (limit == null ? true : count < limit)) {
            generator = (operators.get(operatorExist().tokenType) as (left: Expression, right: Expression) => Expression)
            this.consume(2)
            //while this is true
            let right = support();

            if (right != null) {

                finalExpr = generator(finalExpr, right);

            } else {

                this.logTokenError(this.peek(), `Unexpected token ${this.getTokenTypeName(this.peek().tokenType)}. Expected an Expression instead`)
                process.exit(1)

            }

            count++;
        }

        return finalExpr;

    }

    parseCallSignature(): Expression {

        let identifierName = ""
        this.expect(this.peek(0) as Token, TokenType.Identifier, () => {
            const _thisToken = this.peek(0) as Token
            identifierName = this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1)
            this.advance()
        })

        this.expect(this.peek(0) as Token, TokenType.LBrace, () => this.advance())

        let argumentList: Expression[] = []

        if ((this.peek(0) as Token).tokenType != TokenType.RBrace) {


            let expr = this.parseExpression()
            if (expr != null) {

                argumentList.push(expr)
                this.advance()
                while ((this.peek(0) as Token).tokenType == TokenType.Comma) {

                    this.advance()

                    let __expr = this.parseExpression()
                    if (__expr != null) {

                        argumentList.push(__expr)
                        this.advance()

                    } else {

                        let _v = this.peek()
                        this.logTokenError(_v, `Unexpected token ${this.getTokenTypeName(_v.tokenType)}. Expected an expression instead`)
                        process.exit(1)

                    }

                }

            }

        }

        this.expect(this.peek(0) as Token, TokenType.RBrace, () => {
            //this.advance()
        })

        return new CallSignatureNode(new IdentifierNode(identifierName), argumentList)

    }

    parseAtomicExpression(): Expression {
        const token = this.peek(0)
        switch (token?.tokenType) {
            case TokenType.Identifier:
                return new IdentifierNode(
                    this.source.str.substring(token.span.startIndex, token.span.endIndex + 1)
                )
            case TokenType.RealNumber:
                return new NumberNode(
                    this.source.str.substring(token.span.startIndex, token.span.endIndex + 1),
                    Number.Real
                )
            case TokenType.Integer:
                return new NumberNode(
                    this.source.str.substring(token.span.startIndex, token.span.endIndex + 1),
                    Number.Integer
                )
            case TokenType.String:
                return new StringNode(
                    token.span
                )
            case TokenType.LBrace:

                this.advance()
                //@ts-ignore
                let expr = this.parseExpression();
                //console.log([ this.source.str.substring( this.peek(0)?.span.startIndex, this.peek(0)?.span.endIndex + 1 ) ])
                //@ts-ignore

                if (this.peek(1).tokenType == TokenType.Comma) {
                    this.consume(2)
                    //then capture
                    let argumentList: Expression[] = [];

                    while (this.peek().tokenType != TokenType.RBrace) {

                        let val = this.parseExpression()
                        this.advance()

                        if (val != null) {
                            argumentList.push(val)
                        } else {

                            this.logTokenError(this.peek(), `Unexpected token ${this.getTokenTypeName(this.peek().tokenType)}. Expected an Expression instead`)
                            process.exit(1)
                        }

                        if (this.peek().tokenType != TokenType.RBrace) {
                            this.shouldBe(TokenType.Comma)
                        }

                    }

                    expr = new CallSignature(argumentList)

                } else {

                    this.expect(this.peek(1), TokenType.RBrace, () => this.advance())
                
                }

                return expr

            case TokenType.LSquareBrace:
                this.advance()
                let offset = null
                const _expr = this.parseExpression();
                this.advance()

                this.maybeExpect(this.peek(0) as Token, TokenType.StraightBar, () => {

                    this.advance()
                    offset = this.parseExpression()
                    this.advance()

                }, () => {

                })

                this.expect(this.peek(0) as Token, TokenType.RSquareBrace, () => { })
                return new PointerExpressionNode(_expr, offset)

            case TokenType.HashSymbol:
                this.advance()
                this.shouldBe(TokenType.LSquareBrace)
                let _offset = null
                const __expr = this.parseExpression();
                this.advance()

                this.maybeExpect(this.peek(0) as Token, TokenType.StraightBar, () => {

                    this.advance()
                    _offset = this.parseExpression()
                    this.advance()

                }, () => {

                })

                this.expect(this.peek(0) as Token, TokenType.RSquareBrace, () => { })
                return new HandlExpressionNode(__expr, _offset)

            case TokenType.K_Adrs:
                this.advance()
                const $__expr = this.parseAtomicExpression()
                return new UnaryOperatorNode($__expr, UnaryOperation.AddressOf)

            case TokenType.K_Sizeof:
                this.advance()
                const $$_expr = this.parseAtomicExpression()
                return new UnaryOperatorNode($$_expr, UnaryOperation.SizeOf)

            case TokenType.DollarSign:
                this.advance()
                const $_expr = this.parseAtomicExpression()
                return new ViewExpression($_expr)

            case TokenType.Backtick:
                //console.log('This one')
                this.advance()
                const ___expr = this.parseAtomicExpression()
                //console.log(this.getTokenTypeName(this.peek(0)?.tokenType))
                return new ReferenceExpressionNode(___expr);

            default:
                return null;
        }
    }

    parseCLSignature(): Expression {

        const left = this.parseAtomicExpression()
        if (left == null) return null;

        let finalExpr: Expression = left;

        const operatorExist = () => this.peek(1) as Token;

        if (operatorExist().tokenType == TokenType.LBrace) {
            //we process
            this.consume(2)
            let argumentList: Expression[] = []

            while (this.peek().tokenType != TokenType.RBrace) {

                let right = this.parseExpression()
                this.advance()
                if (right != null) {
                    argumentList.push(right)
                } else {
                    this.logTokenError(this.peek(), `Unexpected token ${this.getTokenTypeName(this.peek().tokenType)}. Expected an Expression instead`)
                    process.exit(1)
                }

                if (this.peek().tokenType != TokenType.RBrace) {
                    this.shouldBe(TokenType.Comma)
                }

            }

            finalExpr = new BinaryOperatorNode(finalExpr, new CallSignature(argumentList), BinaryOperation.CallSignature)

        }

        return finalExpr

    }

    parseBindingAccess(): Expression {
        return this.parseLeftAssociativeOperator(
            () => this.parseCLSignature(),
            new Map(
                [[
                    TokenType.DoubleColon,
                    (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.BindingAccess)
                ]]
            ),
            1
        );
    }

    parseMagneticAccess(): Expression {

        return this.parseLeftAssociativeOperator(
            () => this.parseBindingAccess(),
            new Map(
                [[
                    TokenType.ArrowRight,
                    (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.MagneticCall)
                ]]
            ),
        );

    }

    parseMemberAccess(): Expression {

        return this.parseLeftAssociativeOperator(
            () => this.parseMagneticAccess(),
            new Map([[TokenType.Dot,
            (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.MemberAccess)]]),
        );

    }

    parseMultiplicationDivision(): Expression {
        return this.parseLeftAssociativeOperator(
            () => this.parseMemberAccess(),
            new Map(
                [
                    [TokenType.Divide, (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.Divide)],
                    [TokenType.Multiply, (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.Multiply)]
                ]
            ),
        )
    }

    parseAdditionSubtraction(): Expression {
        return this.parseLeftAssociativeOperator(
            () => this.parseMultiplicationDivision(),
            new Map(
                [
                    [TokenType.Add, (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.Add)],
                    [TokenType.Minus, (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.Subtract)]
                ]
            )
        )
    }

    parseInequalities(): Expression {
        return this.parseLeftAssociativeOperator(
            () => this.parseAdditionSubtraction(),
            new Map(
                [
                    [TokenType.GreaterThan, (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.GreaterThan)],
                    [TokenType.GreaterThanEqual, (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.GreaterThanEqual)],
                    [TokenType.LessThan, (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.LessThan)],
                    [TokenType.LessThanEqual, (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.LessThanEqual)]
                ]
            ),
            1
        )
    }

    parseEquality(): Expression {
        return this.parseLeftAssociativeOperator(
            () => this.parseInequalities(),
            new Map([
                [TokenType.Compare, (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.Equals)],
                [TokenType.NotEqual, (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.NotEquals)]
            ]),
        );
    }

    parseAssignment(): Expression {
        return this.parseLeftAssociativeOperator(
            () => this.parseEquality(),
            new Map(
                [
                    [
                        TokenType.Assignment,
                        (left, right) => new BinaryOperatorNode(left, right, BinaryOperation.Assignment)
                    ]
                ]
            ),
        );
    }

    parseExpression(): Expression {
        return this.parseAssignment()
    }

}