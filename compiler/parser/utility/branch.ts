import { TokenType, type Token } from "../../lexer/tokens";
import { EmptyNode, Node } from "../ast";
import type { Parser } from "../parser";

export type BranchMap = Map<TokenType, (parser: Parser, sync: Set<TokenType>, title: string) => any>;

export function createBranch<T>(production: (parser: Parser, sync: Set<TokenType>, title: string) => T, ...tokens: TokenType[]): BranchMap {

    const branchMap: BranchMap = new Map()
    for (let token of tokens) {
        branchMap.set(token, production)
    }

    return branchMap

}

export function branchGroup(...branches: BranchMap[]): BranchMap {

    //flatten the branch groups basically
    const flattenMap: BranchMap = new Map()

    for (let branch of branches) {

        for (let [key, value] of branch) {

            flattenMap.set(key, value) //flattens the branch

        }

    }

    return flattenMap

}

export function useBranch(parser: Parser, branchTable: BranchMap, title: string, sync: Set<TokenType>) {

    const token = parser.peek()
    const production = branchTable.get(token.tokenType)

    if (production !== undefined) {
        return production(parser, sync, title)
    }

    parser.syncToken(false, sync, title, token)
    return new EmptyNode("From Branching")
    
}