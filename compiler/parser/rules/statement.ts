import { TokenType } from "../../lexer/tokens";
import { nterm, production, token } from "../api/token";
import { AST, ASTEnum } from "./ast";
import { Expression, expression } from "./expressions";

export class ReturnStatement extends AST<ASTEnum.RETURN> {
    constructor(public body: Expression) {
        super(ASTEnum.RETURN)
    }
}

export const returnStatement = production(

    token(TokenType.K_Return),
    nterm(expression).save()

).ast((finish, expr: Expression) => finish(new ReturnStatement(expr)));