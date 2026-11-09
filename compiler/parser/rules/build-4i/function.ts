import { StringSpan, Token, TokenType } from "../../../lexer/tokens"
import { loop, nterm, production, token } from "../../api/token"
import { AST, ASTEnum } from "./ast"
import { TypeSystem, typeSystem } from "./type"

export class FunctionArguments extends AST<ASTEnum.FUNCTION_ARGS> {
    constructor(public args: TypeSystem[]) {
        super(ASTEnum.FUNCTION_ARGS)
    }
}

const functionArguments = production(

    loop({
        prod: nterm(typeSystem),
        deliminator: token(TokenType.RBrace),
        separator: token(TokenType.Comma),
        allowEmpty: true
    }).save()

).ast((finish, args: TypeSystem[]) => {
    return finish(new FunctionArguments(args))
})

export class FunctionNode extends AST<ASTEnum.FUNCTION> {

    constructor(public name: string, public name_span: StringSpan, public args: FunctionArguments) {
        super(ASTEnum.FUNCTION)
    }

}

export const fx = production(
    token(TokenType.K_Fx).err("Expected 'fx' to begin a function declaration"),
    token(TokenType.Identifier).save().err("Expected a function name after 'fx'"),
    token(TokenType.LBrace).err("Expected '(' to begin the function parameter list"),
    nterm(functionArguments).save(),
    token(TokenType.LBracket).err("Expected '{' to begin the function body"),
    token(TokenType.RBracket).err("Expected '}' to close the function body")
).ast((finish, name: Token, arg: FunctionArguments) =>
    finish(
        new FunctionNode(
            name.span.resolve(), name.span, arg
        )
    )
)