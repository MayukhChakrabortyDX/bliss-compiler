import { TokenType } from "../../lexer/tokens";
import { loop, maybe, production, token } from "../api/token";

export const loopProduction = production(
    token(TokenType.K_Loop).err("Expected the keyword loop"),
    maybe(
        token(TokenType.Identifier)
    ).defaultReturn("").save(),
    token(TokenType.LBracket).err("Expected '{' to start the loop body"),
    token(TokenType.RBracket).err("Expected '}' to end the loop body")
).ast((finish, name: string) => name)