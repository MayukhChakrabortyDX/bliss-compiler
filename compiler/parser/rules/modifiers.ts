import { TokenType } from "../../lexer/tokens";
import type { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";

export namespace Modifier {

    export const first = new Set([ TokenType.K_Unsafe, TokenType.K_Trans, TokenType.K_Volatile ])

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

    const branch = branchGroup(volatileBranch, transBranch, unsafeBranch)

    export function parse(parser: Parser, sync: Set<TokenType>) {
        return parser.useBranch(branch, "This is not a valid modifier", sync)
    }

}