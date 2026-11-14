import { Token, TokenType } from "../../lexer/tokens";
import { production, token } from "../api/token";
import { AST, ASTEnum } from "./ast";

export class Expression extends AST<ASTEnum.EXPRESSION> {
    constructor(public integer: Token) {
        super(ASTEnum.EXPRESSION)
    }
}

export const expression = production(
    token(TokenType.Integer).save()
).ast((finish, int: Token) => finish(new Expression(int)))