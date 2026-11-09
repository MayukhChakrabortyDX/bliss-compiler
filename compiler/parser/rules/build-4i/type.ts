//we are now going to implement the type system from the type paper.
//the grammar is - dimension(...modifiers) name: TypeName

import { StringSpan, Token, TokenType } from "../../../lexer/tokens";
import { branch, production, token } from "../../api/token";
import { AST, ASTEnum } from "./ast";

export class TypeSystem extends AST<ASTEnum.TYPE_SYSTEM> {

    constructor(public name: string, public name_span: StringSpan, public type: Token) {
        super(ASTEnum.TYPE_SYSTEM)
    }

}

export const typeSystem = production(
    token(TokenType.K_Data).err("Expected the keyword data"),
    token(TokenType.Identifier).save().err("Expected a name for the type"),
    token(TokenType.Colon).err("Expected a colon"),
    branch(
        token(TokenType.K_i8),
        token(TokenType.K_i16),
        token(TokenType.K_i32),
        token(TokenType.K_i64),
        token(TokenType.K_u8),
        token(TokenType.K_u16),
        token(TokenType.K_u32),
        token(TokenType.K_u64)
    ).save()
).ast((finish, name: Token, type: Token) => {
    return finish(new TypeSystem(name.span.resolve(), name.span, type))
})