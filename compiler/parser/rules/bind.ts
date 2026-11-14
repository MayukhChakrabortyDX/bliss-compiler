import { StringSpan, Token, TokenType } from "../../lexer/tokens";
import { branch, loop, nterm, production, token } from "../api/token";
import { AST, ASTEnum } from "./ast";
import { FunctionNode, fx } from "./function";

const identifier = production(
    token(TokenType.Identifier).save().err("Expected an identifier")
).ast((_, name: Token) => name)

const actionList = production(
    token(TokenType.LBrace).err("Expected '(' to begin the action list"),
    loop({
        prod: nterm(identifier).save(),
        separator: token(TokenType.Comma).err("Expected ',' between action names"),
        deliminator: token(TokenType.RBrace).err("Expected ')' to close the action list"),
        allowEmpty: false,
    }).save()
).ast((_, actions: Token[]) => actions)

const actionNames = branch(
    nterm(identifier).saveAs((name: string) => [name]),
    nterm(actionList).save()
).err("Ensure you have a valid list of action to bind with").defaultReturn([])

export class BindNode extends AST<ASTEnum.BIND> {
    constructor(
        public dataName: string, public dataNameSpan: StringSpan,
        public actionNames: string[], public actionNameSpans: StringSpan[],
        public bindingName: string, public bindingNameSpan: StringSpan,
        public functionDefinitions: FunctionNode[]
    ) {
        super(ASTEnum.BIND)
    }
}

export const bind = production(
    token(TokenType.K_Bind).err("Expected 'bind' to begin a binding declaration"),
    token(TokenType.Identifier).save().err("Expected a name for the binding"),
    token(TokenType.K_With).err("Expected 'with' after the binding name"),
    // Action naming branch
    actionNames.save(),
    token(TokenType.K_As).err("Expected 'as' after the action names"),
    token(TokenType.Identifier).save().err("Expected a name for the binding token"),
    token(TokenType.LBracket).err("Expected '{' to begin the binding body"),
    loop({
        prod: nterm(fx).save(),
        deliminator: token(TokenType.RBracket)
            .err("Expected '}' to close the binding body"),
        allowEmpty: false,
    }).save()
)

.ast((finish, dataName: Token, actionNames: Token[], bindingName: Token, functionDefinitions: FunctionNode[]) => {
    return finish(
        new BindNode(
            dataName.span.resolve(), dataName.span,
            actionNames.map(actionName => actionName.span.resolve()), actionNames.map(actionName => actionName.span),
            bindingName.span.resolve(), bindingName.span,
            functionDefinitions
        )
    )
})