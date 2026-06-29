import { Log, log } from "../../../logger";
import { Token, TokenType } from "../../tokenizer/tokens";
import {
    AssignmentNode, BreakStatementNode,
    CallSignatureNode, CallStatement,
    ConditionalNode, ConditionNode,
    ExpressionAsStatement,
    IdentifierNode,
    LoopNode, NodeType, ReturnStatementNode,
    VariableDeclNode, ViewDeclNode, ViewStatementNode, type Expression,
    type StatementNode
} from "../ast";
import { ParseTypes } from "./types";

export class ParseStatement extends ParseTypes {

    statementSet = new Set([TokenType.K_View, TokenType.K_Unsafe, TokenType.K_Let, TokenType.K_Return, TokenType.K_Break, TokenType.K_Loop, TokenType.K_If, TokenType.Identifier])

    parseAssignment() {

        let variableName: string = ""
        this.expect(this.peek(0) as Token, TokenType.Identifier, () => {

            const token = this.peek(0) as Token
            variableName = this.source.str.substring(token.span.startIndex, token.span.endIndex + 1)
            this.advance()

        })

        this.shouldBe(TokenType.Assignment);

        let expression = this.parseExpression()

        if (expression == null) {
            throw Error("Expression Expected")
        }

        this.advance()
        this.shouldBe(TokenType.Semicolon)

        return new AssignmentNode(variableName, expression)

    }

    parseViewDecl() {

        let thisViewCanBeInPlaceDefinition = false
        let branchToDefinition2 = false;
        this.shouldBe(TokenType.K_View)
        let expression = this.parseExpression()
        this.advance()

        if (expression == null) {
            throw Error("View expression cannot be null")
        } else if (expression.type == NodeType.Identifier) {
            thisViewCanBeInPlaceDefinition = true;
        }

        this.maybeExpect(this.peek(0) as Token, TokenType.K_As, () => {

            //then things are going as usual
            this.advance()

        }, () => {

            this.shouldBe(TokenType.Colon)
            branchToDefinition2 = true;


        })

        if (branchToDefinition2 == false) {
            
            let identifier = this.digest(TokenType.Identifier)
            this.shouldBe(TokenType.Colon)
            let type = this.parseType()
            this.shouldBe(TokenType.Semicolon)

            return new ViewStatementNode(expression, identifier, type)

        } else {

            return this.parseViewVariableDecl((expression as IdentifierNode).name)

        }

    }

    parseViewVariableDecl(variableName: string) {

        let returnType = this.parseType()
        this.shouldBe(TokenType.Assignment)
        let expression = this.parseExpression()

        if (expression == null) {
            throw Error("Expression Expected")
        }

        this.advance()

        this.shouldBe(TokenType.Semicolon)

        return new ViewDeclNode(variableName, returnType, expression)
    }

    parseVariableDecl() {

        let unsafe: boolean = false;
        let variableName: string = ""

        this.maybeExpect(this.peek(0) as Token, TokenType.K_Unsafe, () => {
            unsafe = true
            this.advance()
        }, () => { })

        this.shouldBe(TokenType.K_Let)

        variableName = this.digest(TokenType.Identifier)

        this.shouldBe(TokenType.Colon)

        let returnType = this.parseType()
        this.shouldBe(TokenType.Assignment)
        let expression = this.parseExpression()

        if (expression == null) {
            throw Error("Expression Expected")
        }

        this.advance()

        this.shouldBe(TokenType.Semicolon)

        return new VariableDeclNode(variableName, returnType, expression, unsafe)

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

            let exp: Expression = null;

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

    parseStatement(): ReturnStatementNode | BreakStatementNode | LoopNode | ConditionNode {

        const initial = this.peek(0)
        //we do branching here
        switch (initial?.tokenType) {

            case TokenType.K_View:
                return this.parseViewDecl()
            case TokenType.K_Return:
                return this.parseReturn()
            case TokenType.K_Break:
                return this.parseBreak()
            case TokenType.K_Loop:
                return this.parseLoop()
            case TokenType.K_If:
                return this.parseCondition()
            // case TokenType.Identifier:
            //     if ((this.peek(1) as Token).tokenType == TokenType.Assignment) {
            //         return this.parseAssignment()
            //     }
            //     const call_expr = this.parseCallSignature()
            //     this.advance()
            //     this.expect(this.peek(0) as Token, TokenType.Semicolon, () => this.advance())
            //     return new CallStatement(call_expr as CallSignatureNode)

            case TokenType.K_Let:
            case TokenType.K_Unsafe:
                return this.parseVariableDecl()

            default:
                const __expr = this.parseMemberAccess()
                if ( __expr != null ) {
                    this.advance()
                    this.shouldBe(TokenType.Semicolon)
                    return new ExpressionAsStatement(__expr)
                }
                //no other matches can be done
                log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${initial?.tokenType}`)
                process.exit(1)

        }

    }

}