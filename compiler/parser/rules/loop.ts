import { TokenType } from "../../lexer/tokens";
import { maybe, production, token } from "../api/token";
import { AST, ASTEnum } from "./ast";

export class LoopNode extends AST<ASTEnum.LOOP> {
    constructor(public loopName: string) {
        super(ASTEnum.LOOP)
    }
}

export const loopProduction = production(
    
    token(TokenType.K_Loop).err("Expected the keyword loop"),
    maybe(
        token(TokenType.Identifier)
    ).defaultReturn("").save(),
    token(TokenType.LBracket).err("Expected '{' to start the loop body"),
    token(TokenType.RBracket).err("Expected '}' to end the loop body")

).ast((finish, name: string) => finish(new LoopNode(name)))