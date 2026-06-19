import { FunctionDefinitionNode, IdentifierNode, NumberNode, Number, ProgramNode, ReturnStatementNode, type StatementNode, BinaryOperatorNode, BinaryOperation, ImportNode, UsingNode, StringNode, BreakStatementNode, LoopNode, type Expression, ConditionNode, ConditionalNode, CallSignatureNode, CallStatement } from "./ast";
import { StringContainer, Token, TokenType } from "./tokens";
import { log, Log } from "../logger";

export class Parser {

    tokenIndex: number = 0; //this is where the program exist for now
    constructor(public tokenStream: Token[], public source: StringContainer) { }

    getTokenTypeName(tokenType: TokenType) {
        return TokenType[tokenType]
    }

    peek(amount: number) {
        //tells us what is at that
        if (this.tokenStream.length > amount + this.tokenIndex) {
            return this.tokenStream[amount + this.tokenIndex]
        } else {
            return null
        }
    }

    consume(tokens: number) {
        //consume this many tokens
        if (this.tokenIndex + tokens > this.tokenStream.length) {
            log(Log.Error, "PARSER", "Internal Error - Token Consumption Failed", "The parser tried to consume tokens from outside the token range")
        }
        this.tokenIndex += tokens; //increase this much
    }

    advance() {
        this.consume(1)
    }

    expect(given: Token, expected: TokenType, callback: () => any) {
        if (given.tokenType == expected) {
            callback()
        } else {

            log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${this.getTokenTypeName(given.tokenType)}. Expected token type ${this.getTokenTypeName(expected)} instead`)
            process.exit(1)

        }
    }

    maybeExpect(given: Token, expected: TokenType, whenTrue: () => any, whenFalse: () => any) {
        if (given.tokenType == expected) {
            whenTrue()
        } else {
            whenFalse()
        }
    }

    //@ts-ignore
    parseInequalities() {
        //@ts-ignore
        const left = this.parseAdditionSubtraction();

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

                finalExpr = new BinaryOperatorNode(left, right,
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
            return left;

        }

        return finalExpr;

    }

    //@ts-ignore
    parseAdditionSubtraction() {
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
    parseMultiplicationDivision() {
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
    parseAtomicExpression() {
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
    parseExpression() {
        return this.parseInequalities()
    }

    parseBreak() {

        let identifier: string | null = null
        this.expect(this.peek(0) as Token, TokenType.K_Break, () => this.advance());

        this.maybeExpect(this.peek(0) as Token, TokenType.Identifier, () => {

            const _thisToken = this.peek(0) as Token
            identifier = this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1);
            this.advance()

        }, () => {


        })

        this.expect(this.peek(0) as Token, TokenType.Semicolon, () => this.advance())
        return identifier == null ? new BreakStatementNode() : new BreakStatementNode(identifier)

    }

    parseReturn() {

        const firstToken = this.peek(0)
        let expression = null
        //@ts-ignore
        this.expect(firstToken, TokenType.K_Return, () => this.advance());

        expression = this.parseExpression()

        if (expression != null) {
            this.advance()
        }

        const lastToken = this.peek(0)
        //@ts-ignore
        this.expect(lastToken, TokenType.Semicolon, () => this.advance())

        return expression == null ? new ReturnStatementNode() : new ReturnStatementNode(expression);

    }

    parseLoop() {

        let identifier: string | null = null;
        let body: StatementNode[] = []

        this.expect(this.peek(0) as Token, TokenType.K_Loop, () => this.advance())

        this.maybeExpect(this.peek(0) as Token, TokenType.Identifier, () => {
            const _thisToken = this.peek(0) as Token
            identifier = this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1);
            this.advance()
        }, () => { })

        this.expect(this.peek(0) as Token, TokenType.LBracket, () => this.advance())

        while (this.statementSet.has((this.peek(0) as Token).tokenType)) {
            //@ts-ignore
            body.push(this.parseStatement())
        }

        this.expect(this.peek(0) as Token, TokenType.RBracket, () => this.advance())

        return identifier == null ? new LoopNode(body) : new LoopNode(body, identifier)

    }

    parseCondition() {

        let if_branch: ConditionalNode = new ConditionalNode([])
        let elif_branch: ConditionalNode[] = []
        let elseBranch: ConditionalNode | undefined = undefined;

        this.expect(this.peek(0) as Token, TokenType.K_If, () => this.advance())
        this.expect(this.peek(0) as Token, TokenType.LBrace, () => this.advance())


        if_branch.condition = this.parseExpression();
        this.advance()

        if (if_branch.condition == null) {

            throw new Error("Expression Expected")

        }

        this.expect(this.peek(0) as Token, TokenType.RBrace, () => this.advance())
        this.expect(this.peek(0) as Token, TokenType.LBracket, () => this.advance())

        while (this.statementSet.has((this.peek(0) as Token).tokenType)) {
            if_branch.conditionBody.push(this.parseStatement())
        }

        this.expect(this.peek(0) as Token, TokenType.RBracket, () => this.advance())

        //now process the elifs
        while ((this.peek(0) as Token).tokenType == TokenType.K_Elif) {

            const statements: StatementNode[] = []

            this.expect(this.peek(0) as Token, TokenType.K_Elif, () => this.advance())
            this.expect(this.peek(0) as Token, TokenType.LBrace, () => this.advance())

            let exp: Expression | null = null;

            exp = this.parseExpression();
            this.advance()

            if (exp == null) {

                throw new Error("Expression Expected")

            }

            this.expect(this.peek(0) as Token, TokenType.RBrace, () => this.advance())
            this.expect(this.peek(0) as Token, TokenType.LBracket, () => this.advance())

            while (this.statementSet.has((this.peek(0) as Token).tokenType)) {
                statements.push(this.parseStatement())
            }

            this.expect(this.peek(0) as Token, TokenType.RBracket, () => this.advance())

            elif_branch.push(new ConditionalNode(statements, exp))

        }

        this.maybeExpect(this.peek(0) as Token, TokenType.K_Else, () => {

            elseBranch = new ConditionalNode([], undefined)

            this.expect(this.peek(0) as Token, TokenType.K_Else, () => this.advance())
            this.expect(this.peek(0) as Token, TokenType.LBracket, () => this.advance())

            while (this.statementSet.has((this.peek(0) as Token).tokenType)) {
                elseBranch.conditionBody.push(this.parseStatement())
            }

            this.expect(this.peek(0) as Token, TokenType.RBracket, () => this.advance())

        }, () => { })

        return new ConditionNode(if_branch, elif_branch, elseBranch)

    }

    statementSet = new Set([TokenType.K_Return, TokenType.K_Break, TokenType.K_Loop, TokenType.K_If, TokenType.Identifier])

    parseStatement(): ReturnStatementNode | BreakStatementNode | LoopNode | ConditionNode {

        const initial = this.peek(0)
        //we do branching here
        switch (initial?.tokenType) {

            case TokenType.K_Return:
                return this.parseReturn()
            case TokenType.K_Break:
                return this.parseBreak()
            case TokenType.K_Loop:
                return this.parseLoop()
            case TokenType.K_If:
                return this.parseCondition()
            case TokenType.Identifier:
                const call_expr = this.parseCallSignature()
                this.advance()
                this.expect(this.peek(0) as Token, TokenType.Semicolon, () => this.advance())
                return new CallStatement(call_expr)

            default:
                //no other matches can be done
                log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${initial?.tokenType}`)
                process.exit(1)

        }

    }

    parseCallSignature() {

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

    parseFunctionDefinition() {

        let name: string = "";
        let body: StatementNode[] = []

        this.advance() // from the fx token ofc

        const firstToken = this.peek(0)
        //@ts-ignore
        this.expect(firstToken, TokenType.Identifier, () => {
            //@ts-ignore
            name = this.source.str.substring(firstToken?.span.startIndex, firstToken?.span.endIndex + 1);
        })

        this.advance();

        const secondToken = this.peek(0)
        //@ts-ignore
        this.expect(secondToken, TokenType.LBrace, () => this.advance())

        const thirdToken = this.peek(0)
        //@ts-ignore
        this.expect(thirdToken, TokenType.RBrace, () => this.advance())

        const forthToken = this.peek(0)
        //@ts-ignore
        this.expect(forthToken, TokenType.LBracket, () => this.advance())

        //we consume the statements
        while (this.statementSet.has((this.peek(0) as Token).tokenType)) {
            //@ts-ignore
            body.push(this.parseStatement())
        }

        const fifthToken = this.peek(0)
        //@ts-ignore
        this.expect(fifthToken, TokenType.RBracket, () => this.advance())

        return new FunctionDefinitionNode(name, body)

    }

    parseImport() {

        let moduleSequence: string[] = []

        this.expect(this.peek(0) as Token, TokenType.K_Import, () => this.advance());

        this.expect(this.peek(0) as Token, TokenType.Identifier, () => {

            const _thisToken = this.peek(0) as Token

            moduleSequence.push(
                this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1)
            )

            this.advance()

        })

        while ((this.peek(0) as Token).tokenType == TokenType.Dot) {

            this.advance()

            this.expect(this.peek(0) as Token, TokenType.Identifier, () => {

                const _thisToken = this.peek(0) as Token

                moduleSequence.push(
                    this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1)
                )

                this.advance()

            })

        }

        this.expect(this.peek(0) as Token, TokenType.Semicolon, () => this.advance())
        return new ImportNode(moduleSequence)

    }

    parseUsing() {

        let moduleSequence: string[] = []

        this.expect(this.peek(0) as Token, TokenType.K_Using, () => this.advance());

        this.expect(this.peek(0) as Token, TokenType.Identifier, () => {

            const _thisToken = this.peek(0) as Token

            moduleSequence.push(
                this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1)
            )

            this.advance()

        })

        while ((this.peek(0) as Token).tokenType == TokenType.Dot) {

            this.advance()

            this.expect(this.peek(0) as Token, TokenType.Identifier, () => {

                const _thisToken = this.peek(0) as Token

                moduleSequence.push(
                    this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1)
                )

                this.advance()

            })

        }

        this.expect(this.peek(0) as Token, TokenType.Semicolon, () => this.advance())
        return new UsingNode(moduleSequence)

    }

    parseProgram() {

        const importList: ImportNode[] = [];
        const functionList: FunctionDefinitionNode[] = [];

        while ((this.peek(0) as Token).tokenType == TokenType.K_Import || (this.peek(0) as Token).tokenType == TokenType.K_Using) {
            importList.push(
                (this.peek(0) as Token).tokenType == TokenType.K_Import ? this.parseImport() : this.parseUsing()
            );
        }

        while (this.peek(0)?.tokenType == TokenType.K_Fx) {
            functionList.push(this.parseFunctionDefinition())
            //console.log( this.source.str.substring( this.peek(0)?.span.startIndex, this.peek(0)?.span.endIndex + 1 ) )
        }

        if (this.peek(0)?.tokenType != TokenType.EOF) {
            log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${this.peek(0)?.tokenType}. Expected token type ${TokenType.EOF} instead`)
            process.exit(1)

        }

        return new ProgramNode(functionList, importList);

    }

}