import { Log, log } from "../../../logger";
import { Token, TokenType } from "../../tokenizer/tokens";

import {
    BinaryOperation, BinaryOperatorNode,
    CallSignatureNode, IdentifierNode,
    Number, NumberNode,
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

                        log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${this.getTokenTypeName((this.peek(0) as Token).tokenType)}. Expected an expression instead`)
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

                log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${this.getTokenTypeName(operatorExist.tokenType)}. Expected an Expression instead`)
                process.exit(1)

            }

        } else {

            //this just means we only have 'left' left
            //@ts-ignore
            return left;

        }

        return finalExpr;

    }

    //@ts-ignore
    parseAdditionSubtraction(): Expression {
        //@ts-ignore
        const left = this.parseMultiplicationDivision();

        if (left == null) return null;

        //if not, let's see where we can go.
        let finalExpr = left;

        const operatorExist = this.peek(1);
        if (operatorExist?.tokenType == TokenType.Add || operatorExist?.tokenType == TokenType.Minus) {
            this.consume(2)
            //@ts-ignore
            let right = this.parseMultiplicationDivision();

            if (right != null) {

                finalExpr = new BinaryOperatorNode(left, right, operatorExist.tokenType == TokenType.Add ? BinaryOperation.Add : BinaryOperation.Subtract);

                while (this.peek(1)?.tokenType == TokenType.Add || this.peek(1)?.tokenType == TokenType.Minus) {

                    const _thisToken = this.peek(1)
                    this.consume(2)
                    //while this is true
                    right = this.parseMultiplicationDivision();

                    if (right != null) {

                        //@ts-ignore
                        finalExpr = new BinaryOperatorNode(finalExpr, right, _thisToken.tokenType == TokenType.Add ? BinaryOperation.Add : BinaryOperation.Subtract);

                    } else {

                        log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${operatorExist}. Expected an Expression instead`)
                        process.exit(1)

                    }

                }

            } else {

                //invalid grammar.

                log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${operatorExist}. Expected an Expression instead`)
                process.exit(1)

            }

        } else {

            //this just means we only have 'left' left
            return left;

        }

        return finalExpr;

    }

    //@ts-ignore
    parseMultiplicationDivision(): Expression {
        //order 0 means most priority, which happens to be multiplication for now
        //@ts-ignore
        const left = this.parseAtomicExpression();

        if (left == null) return null;

        //if not, let's see where we can go.
        let finalExpr = left;

        const operatorExist = this.peek(1);
        if (operatorExist?.tokenType == TokenType.Multiply || operatorExist?.tokenType == TokenType.Divide) {
            this.consume(2)
            //@ts-ignore
            let right = this.parseAtomicExpression();

            if (right != null) {

                finalExpr = new BinaryOperatorNode(left, right, operatorExist.tokenType == TokenType.Multiply ? BinaryOperation.Multiply : BinaryOperation.Divide);

                while (this.peek(1)?.tokenType == TokenType.Multiply || this.peek(1)?.tokenType == TokenType.Divide) {

                    const _thisToken = this.peek(1)
                    this.consume(2)
                    //while this is true
                    right = this.parseAtomicExpression();

                    if (right != null) {

                        //@ts-ignore
                        finalExpr = new BinaryOperatorNode(finalExpr, right, _thisToken.tokenType == TokenType.Multiply ? BinaryOperation.Multiply : BinaryOperation.Divide);

                    } else {

                        log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${operatorExist}. Expected an Expression instead`)
                        process.exit(1)

                    }

                }

            } else {

                //invalid grammar.

                log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${operatorExist}. Expected an Expression instead`)
                process.exit(1)

            }

        } else {

            //this just means we only have 'left' left
            return left;

        }

        return finalExpr;

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
            default:
                return null;
        }
    }

    //@ts-ignore
    parseExpression(): Expression {
        return this.parseInequalities()
    }

}