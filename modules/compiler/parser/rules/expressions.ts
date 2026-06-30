import { Token, TokenType } from "../../tokenizer/tokens";

import {
    AddressOfOperator,
    BinaryOperation, BinaryOperatorNode,
    CallSignatureNode, HandlExpressionNode, IdentifierNode,
    MagneticCallChain,
    MemberAccess,
    Number, NumberNode,
    PointerExpressionNode,
    ReferenceExpressionNode,
    SizeOfOperator,
    StringNode, type Expression
} from "../ast";

import { ParserBase } from "../helper";

export class ParseExpressions extends ParserBase {

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

    parseInequalities(): Expression {
        //@ts-ignore
        const left = this.parseAdditionSubtraction();

        //@ts-ignore
        if (left == null) return null;

        //if not, let's see where we can go.
        let finalExpr = left;

        const operatorExist = this.peek(1);
        if (
            operatorExist?.tokenType == TokenType.LessThan || operatorExist?.tokenType == TokenType.GreaterThan ||
            operatorExist?.tokenType == TokenType.LessThanEqual || operatorExist?.tokenType == TokenType.GreaterThanEqual
        ) {
            this.consume(2)
            //@ts-ignore
            let right = this.parseAdditionSubtraction();

            if (right != null) {

                finalExpr = new BinaryOperatorNode(left as Expression, right as Expression,
                    operatorExist.tokenType == TokenType.LessThan ? BinaryOperation.LessThan :
                        operatorExist.tokenType == TokenType.GreaterThan ? BinaryOperation.GreaterThan :
                            operatorExist.tokenType == TokenType.GreaterThanEqual ? BinaryOperation.GreaterThanEqual :
                                BinaryOperation.LessThanEqual
                );

            } else {

                //invalid grammar.
                this.logTokenError(operatorExist, `Unexpected token ${this.getTokenTypeName(operatorExist.tokenType)}. Expected an Expression instead`)
                process.exit(1)

            }

        } else {

            //this just means we only have 'left' left
            //@ts-ignore
            return left;

        }

        return finalExpr;

    }

    parseLeftAssociativeOperator(support: () => Expression, operators: Map<TokenType, (left: Expression, right: Expression) => Expression>): Expression {

        const left = support();

        if (left == null) return null;

        //if not, let's see where we can go.
        let finalExpr: Expression = left;

        const operatorExist = () => this.peek(1) as Token;
        if (operators.has(operatorExist().tokenType)) {

            let generator = (operators.get(operatorExist().tokenType) as (left: Expression, right: Expression) => Expression)

            this.consume(2)
            //@ts-ignore
            let right = support();

            if (right != null) {

                finalExpr = generator(left, right);

                while (operators.has(operatorExist().tokenType)) {
                    generator = (operators.get(operatorExist().tokenType) as (left: Expression, right: Expression) => Expression)
                    this.consume(2)
                    //while this is true
                    right = support();

                    if (right != null) {

                        finalExpr = generator(finalExpr, right);

                    } else {

                        this.logTokenError(operatorExist(), `Unexpected token ${this.getTokenTypeName(operatorExist().tokenType)}. Expected an Expression instead`)
                        process.exit(1)

                    }

                }

            } else {

                //invalid grammar.

                this.logTokenError(operatorExist(), `Unexpected token ${this.getTokenTypeName(operatorExist().tokenType)}. Expected an Expression instead`)
                process.exit(1)

            }

        } else {

            //this just means we only have 'left' left
            return left;

        }

        return finalExpr;

    }

    parseMagneticAccess(): Expression {

        return this.parseLeftAssociativeOperator(
            () => this.parseAtomicExpression(),
            new Map(
                [[
                    TokenType.ArrowRight,
                    (left, right) => new MagneticCallChain(left, right)
                ]]
            ),
        );

    }

    parseMemberAccess(): Expression {

        return this.parseLeftAssociativeOperator(
            () => this.parseMagneticAccess(),
            new Map([[TokenType.Dot,
            (left, right) => new MemberAccess(left, right)]]),
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

    //@ts-ignore
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


    //@ts-ignore
    parseAtomicExpression(): Expression {
        const token = this.peek(0)
        switch (token?.tokenType) {
            case TokenType.Identifier:
                if ((this.peek(1) as Token).tokenType == TokenType.LBrace) {
                    return this.parseCallSignature()
                }
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
                const expr = this.parseExpression();
                //console.log([ this.source.str.substring( this.peek(0)?.span.startIndex, this.peek(0)?.span.endIndex + 1 ) ])
                //@ts-ignore
                this.expect(this.peek(1), TokenType.RBrace, () => this.advance())
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
                return new AddressOfOperator($__expr)

            case TokenType.K_Sizeof:
                this.advance()
                const $$_expr = this.parseAtomicExpression()
                return new SizeOfOperator($$_expr)

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

    //@ts-ignore
    parseExpression(): Expression {
        return this.parseInequalities()
    }

}