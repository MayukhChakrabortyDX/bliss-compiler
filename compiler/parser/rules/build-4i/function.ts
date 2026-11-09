import { StringSpan, Token, TokenType } from "../../../lexer/tokens"
import { production, token } from "../../api/token"
import { AST, ASTEnum } from "./ast"

export class FunctionNode extends AST<ASTEnum.FUNCTION> {

    constructor( public name: string, public name_span: StringSpan ) {
        super(ASTEnum.FUNCTION)
    }

}

export const fx = production(
    token(TokenType.K_Fx).err("Expected 'fx' to begin a function declaration"),
    token(TokenType.Identifier).save().err("Expected a function name after 'fx'"),
    token(TokenType.LBrace).err("Expected '(' to begin the function parameter list"),
    token(TokenType.RBrace).err("Expected ')' to close the function parameter list"),
    token(TokenType.LBracket).err("Expected '{' to begin the function body"),
    token(TokenType.RBracket).err("Expected '}' to close the function body")
).ast((finish, name: Token) => 
    finish(
        new FunctionNode(
            name.span.resolve(), name.span
        )
    )
)