import { TokenType } from "../../../lexer/tokens";
import { branch, loop, nterm, production, token } from "../../api/token";
import { action, ActionNode } from "./action";
import { AST, ASTEnum } from "./ast";
import { dataStruct, DataStructure } from "./data";
import { FunctionNode, fx } from "./function";

export class ProgramNode extends AST<ASTEnum.PROGRAM> {
    constructor(public body: (FunctionNode | DataStructure | ActionNode)[]) {
        super(ASTEnum.PROGRAM)
    }
}

const programItems = branch(
    nterm(fx),
    nterm(dataStruct),
    nterm(action)
)

export const program = production(
    loop({
        prod: programItems,
        deliminator: token(TokenType.EOF),       
    }).save()
)
.ast((_, items: (FunctionNode | DataStructure | ActionNode)[]) => {
    return new ProgramNode(items)
})