import type { Token } from "../../lexer/tokens";
import type { Parser } from "../parser";

export type BranchMap = Map<Token, () => any>;

export function createBranch<T>(production: () => T, ...tokens: Token[]): BranchMap {

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

export function useBranch(parser: Parser, branchTable: BranchMap) {

    const production = branchTable.get(parser.peek())

    if (production !== undefined) {
        return production()
    }

    return parser.panic()
    
}