import { TokenType } from "../../../lexer/tokens";
import { loop, nterm, production, token } from "../../api/token";
import { AST, ASTEnum } from "./ast";
import { FunctionNode, fx } from "./function";

export class ProgramNode extends AST<ASTEnum.PROGRAM> {
    constructor(public functions: FunctionNode[]) {
        super(ASTEnum.PROGRAM)
    }
}

export const program = production(
    loop({
        prod: nterm(fx),
        deliminator: token(TokenType.EOF),       
    }).save()
)
.ast((_, functions: FunctionNode[]) => new ProgramNode(functions))