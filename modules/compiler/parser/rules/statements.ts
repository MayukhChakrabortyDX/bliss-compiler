import { Token, TokenType } from "../../tokenizer/tokens";
import {
    NodeType, Node,
} from "../globalAst";

import { type TypeNode } from "./types";

import { ParseTypes } from "./types";
import { CallSignatureNode } from "./expressions/ast";

import type { Expression } from "./expressions/ast";

export class CallStatement extends Node {
    constructor(public callExpr: CallSignatureNode) {
        super(NodeType.CallStatement)
    }
}

export class ViewStatementNode extends Node {
    constructor(public expression: Expression, public identifier: string, public viewType: TypeNode) {
        super(NodeType.ViewStatement)
    }
}

export class TransformStatementNode extends Node {
    constructor(public expression: Expression, public identifier: string, public transformTo: TypeNode) {
        super(NodeType.TransformStatement)
    }
}

export class ViewDeclNode extends Node {
    constructor(public name: string, public type_of_variable: TypeNode, public expression: Expression) {
        super(NodeType.ViewDeclNode)
    }
}

export class TransformDeclNode extends Node {
    constructor(public name: string, public type_of_variable: TypeNode, public expression: Expression) {
        super(NodeType.TransformDeclNode)
    }
}

export class VariableDeclNode extends Node {
    constructor(public name: string, public type_of_variable: TypeNode, public expression: Expression, public isUnsafe: boolean = false) {
        super(NodeType.VariableDeclNode)
    }
}

export class PointerDeclNode extends Node {
    constructor(public name: string, public type_of_variable: TypeNode, public expression: Expression) {
        super(NodeType.PointerDeclNode)
    }
}

export class LoopNode extends Node {
    constructor(public body: StatementNode[], public identifier?: string) {
        super(NodeType.Loop)
    }
}

export class IdentifierNode extends Node {

    constructor(public name: string) {
        super(NodeType.Identifier)
    }

}

export class ExpressionAsStatement extends Node {
    constructor(public expression: Expression) {
        super(NodeType.ExpressionAsStatement)
    }
}

export class ConditionalNode extends Node {
    constructor(public conditionBody: StatementNode[], public condition?: Expression) {
        super(NodeType.ConditionUnit)
    }
}

export class ConditionNode extends Node {
    constructor(public if_branch: ConditionalNode, public elif_branch: ConditionalNode[], public else_branch?: ConditionalNode) {
        super(NodeType.Condition)
    }
}

export class AliasStatement extends Node {
    constructor(public aliasType: TypeNode, aliasName: string) {
        super(NodeType.AliasStatement)
    }
}

export class ReturnStatementNode extends Node {

    constructor(public expression?: Expression) {
        super(NodeType.ReturnStatement)
    }

}

export class BreakStatementNode extends Node {
    constructor(public identifier?: string) {
        super(NodeType.Break)
    }
}

export type StatementNode = ReturnStatementNode | BreakStatementNode | LoopNode | ConditionNode | CallStatement | ViewStatementNode;

export class ParseStatement extends ParseTypes {

    statementSet = new Set([TokenType.K_View, TokenType.K_Unsafe, TokenType.K_Let, TokenType.K_Return, TokenType.K_Break, TokenType.K_Loop, TokenType.K_If, TokenType.Identifier])

    parseTransformDecl() {

        let thisViewCanBeInPlaceDefinition = false
        let branchToDefinition2 = false;
        this.shouldBe(TokenType.K_Transform)
        let expression = this.parseExpression()
        this.advance()

        if (expression == null) {
            throw Error("View expression cannot be null")
        } else if (expression.type == NodeType.Identifier) {
            thisViewCanBeInPlaceDefinition = true;
        }

        this.maybeExpect(this.peek(0) as Token, TokenType.K_To, () => {

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

            return new TransformStatementNode(expression, identifier, type)

        } else {

            return this.parseViewVariableDecl((expression as IdentifierNode).name)

        }

    }

    parseTransformVariableDecl(variableName: string) {

        let returnType = this.parseType()
        this.shouldBe(TokenType.Assignment)
        let expression = this.parseExpression()

        if (expression == null) {
            throw Error("Expression Expected")
        }

        this.advance()

        this.shouldBe(TokenType.Semicolon)

        return new TransformDeclNode(variableName, returnType, expression)
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

    parsePointerDecl() {

        let variableName: string = ""

        this.shouldBe(TokenType.K_Ptr)

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

        return new PointerDeclNode(variableName, returnType, expression)

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

    parseAlias() {

        this.shouldBe(TokenType.K_Alias)
        const type = this.parseType()
        this.shouldBe(TokenType.K_As)
        const identifier = this.digest(TokenType.Identifier);
        this.shouldBe(TokenType.Semicolon);

        return new AliasStatement(type, identifier)

    }

    parseStatement(): ReturnStatementNode | BreakStatementNode | LoopNode | ConditionNode {

        const initial = this.peek(0)
        //we do branching here
        switch (initial?.tokenType) {

            case TokenType.K_Ptr:
                return this.parsePointerDecl()
            case TokenType.K_Alias:
                return this.parseAlias()
            case TokenType.K_Transform:
                return this.parseTransformDecl()
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
                const __expr = this.parseExpression()
                if (__expr != null) {
                    this.advance()
                    this.shouldBe(TokenType.Semicolon)
                    return new ExpressionAsStatement(__expr)
                }
                //no other matches can be done
                this.logTokenError(initial, `Unexpected token ${initial.tokenType}`)
                process.exit(1)

        }

    }

}