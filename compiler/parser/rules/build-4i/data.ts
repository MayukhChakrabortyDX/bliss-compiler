//we are now implementing data structures!

import { StringSpan, Token, TokenType } from "../../../lexer/tokens";
import { loop, nterm, production, token } from "../../api/token";
import { AST, ASTEnum } from "./ast";
import { TypeSystem, typeSystem } from "./type";

export class DataStructure extends AST<ASTEnum.DATA_STRUCTURE>{
    constructor(public name: string, public name_span: StringSpan, public body: TypeSystem[]) {
        super(ASTEnum.DATA_STRUCTURE)
    }
}

export const dataStruct = production(
    token(TokenType.K_Data).err('Expected the keyword data to start a data structure'),
    token(TokenType.Identifier).save().err('Expected a name for the data structure'),
    token(TokenType.LBracket).err("Expected '{' to start the data structure body"),
    loop({
        prod: nterm(production(
            nterm(typeSystem).save(),
            token(TokenType.Semicolon).err("Expected a semicolon after the field")
        ).ast((_, item) => item)),
        deliminator: token(TokenType.RBracket).err("Expected '}' to end the data structure"),
        allowEmpty: false
    }).save()
)
.ast((finish, name: Token, types: TypeSystem[]) => {
    return finish(
        new DataStructure(name.span.resolve(), name.span, types)
    )
})