import { TokenType } from "../../lexer/tokens";
import type { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";
import { ImportProduction, UsingProduction } from "./module";

export namespace ProgramProduction {

    export const first: Set<TokenType> =
        ImportProduction.first.union(UsingProduction.first)

    const importBranch = createBranch(ImportProduction.parse, TokenType.K_Import)
    const usingBranch = createBranch(UsingProduction.parse, TokenType.K_Using)

    const programBranch = branchGroup(importBranch, usingBranch)

    export function parse(parser: Parser) {

        const nodes = []

        while (true) {

            const token = parser.peek()
            if (token.tokenType == TokenType.EOF) {
                //we reached the delimiter
                parser.advance()
                break;
            }

            nodes.push(
                parser.useBranch(programBranch, "Expected a valid branching structure", first.union(new Set([TokenType.EOF])))
            )

        }

        return nodes

    }

}