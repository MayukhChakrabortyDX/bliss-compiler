import { TokenType } from "../../lexer/tokens";
import type { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";

const unsafeBranch = createBranch((parser, _) => {
    parser.advance()
    return {
        is: "modififier",
        kind: "unsafe"
    }
}, TokenType.K_Unsafe)


const transBranch = createBranch((parser, _) => {
    parser.advance()
    return {
        is: "modififier",
        kind: "trans"
    }
}, TokenType.K_Trans)


const volatileBranch = createBranch((parser, _) => {
    parser.advance()
    return {
        is: "modififier",
        kind: "volatile"
    }
}, TokenType.K_Volatile)


//* VERIFIED AND CACHED
export function parseModifier(parser: Parser, sync: Set<TokenType>) {

    const branch = branchGroup(volatileBranch, transBranch, unsafeBranch)
    return parser.useBranch(branch, "This is not a valid modifier", sync)

}