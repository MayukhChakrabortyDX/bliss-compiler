import { StringSpan, Token, TokenType } from "../../lexer/tokens";
import { loop, nterm, production, token } from "../api/token";
import type { FunctionHead } from "./function";
import { AST, ASTEnum } from "./ast";
import { fxHead } from "./function";

export class ActionNode extends AST<ASTEnum.ACTION> {
    constructor( public name: string, public name_span: StringSpan, public body: FunctionHead[] ) {
        super(ASTEnum.ACTION)
    }
}

const actionField = production(
    nterm(fxHead)
        .save(),
    token(TokenType.Semicolon)
        .err("Expected a semicolon ';' after the function declaration")
).ast((finish, head) => finish(head))

export const action = production(
    token(TokenType.K_Action)
        .err("Expected the 'action' keyword to declare an action"),
    token(TokenType.Identifier)
        .save()
        .err("Expected an identifier for the action name"),
    token(TokenType.LBracket)
        .err("Expected '{' to begin the action body"),
    loop({
        prod: nterm(actionField).save(),
        deliminator: token(TokenType.RBracket)
            .err("Expected '}' to close the action body"),
        allowEmpty: false,
    }).save()
).ast((finish, name: Token, body: FunctionHead[]) => {
    return finish(new ActionNode(name.span.resolve(), name.span, body))
})