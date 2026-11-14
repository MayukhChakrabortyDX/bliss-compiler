import { StringSpan, Token, TokenType } from "../../lexer/tokens"
import { loop, nterm, production, token } from "../api/token"
import { AST, ASTEnum } from "./ast"
import { ReturnStatement, returnStatement } from "./statement"
import { typeName, TypeSystem, typeSystem } from "./type"

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

    constructor(public name: string, public name_span: StringSpan, public args: FunctionArguments, public returnType: Token, public body: ReturnStatement[]) {
        super(ASTEnum.FUNCTION)
    }

}

const functionBody = loop({
    prod: nterm(production(
        nterm(returnStatement).save(),
        token(TokenType.Semicolon)
    ).ast((_, ret) => ret)).save(),
    allowEmpty: true,
    deliminator: token(TokenType.RBracket)
})

export const fx = production(
    token(TokenType.K_Fx).err("Expected 'fx' to begin a function declaration"),
    token(TokenType.Identifier).save().err("Expected a function name after 'fx'"),
    token(TokenType.LBrace).err("Expected '(' to begin the function parameter list"),
    nterm(functionArguments).save(),

    //add the return type
    token(TokenType.Colon),

    nterm(
        production(
            typeName.save()
        ).ast((_, typename) => typename)
    ).save(),


    token(TokenType.LBracket).err("Expected '{' to begin the function body"),
    functionBody.save()

).ast((finish, name: Token, arg: FunctionArguments, returnType: Token, body: ReturnStatement[]) =>
    finish(
        new FunctionNode(
            name.span.resolve(), name.span, arg, returnType, body
        )
    )
)

//----this is the head of a function used for actions and surfaces----//

export class FunctionHead extends AST<ASTEnum.FUNCTION_HEAD> {

    constructor(public name: string, public name_span: StringSpan, public args: FunctionArguments) {
        super(ASTEnum.FUNCTION_HEAD)
    }

}

export const fxHead = production(
    token(TokenType.K_Fx).err("Expected 'fx' to begin a function declaration"),
    token(TokenType.Identifier).save().err("Expected a function name after 'fx'"),
    token(TokenType.LBrace).err("Expected '(' to begin the function parameter list"),
    nterm(functionArguments).save()
).ast((finish, name: Token, arg: FunctionArguments) =>
    finish(
        new FunctionHead(
            name.span.resolve(), name.span, arg
        )
    )
)