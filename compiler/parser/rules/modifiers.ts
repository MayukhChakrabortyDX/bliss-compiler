import { TokenType } from "../../lexer/tokens";
import type { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";
import { ParseNode, ParseNodeEnum } from "../utility/parse_node";

export enum ModifierEnum {
    Unsafe, Trans, Volatile, Const
}

export class Modifier<T extends ModifierEnum> extends ParseNode<ParseNodeEnum.Modifier> {
    constructor(public modifierKind: T) {
        super(ParseNodeEnum.Modifier)
    }
}

const constBranch = createBranch((parser, _) => {
    parser.advance()
    return new Modifier(ModifierEnum.Const)
}, TokenType.K_Const)

const unsafeBranch = createBranch((parser, _) => {
    parser.advance()
    return new Modifier(ModifierEnum.Unsafe)
}, TokenType.K_Unsafe)


const transBranch = createBranch((parser, _) => {
    parser.advance()
    return new Modifier(ModifierEnum.Trans)
}, TokenType.K_Trans)

const volatileBranch = createBranch((parser, _) => {
    parser.advance()
    return  new Modifier(ModifierEnum.Volatile)
}, TokenType.K_Volatile)


//* VERIFIED AND CACHED
export function parseModifier(parser: Parser, sync: Set<TokenType>) {

    const branch = branchGroup(volatileBranch, transBranch, unsafeBranch, constBranch)
    return parser.useBranch(branch, "This is not a valid modifier", sync)

}