import { TokenType, type Token } from "../../lexer/tokens";
import { EmptyNode, Node } from "../ast";
import type { Parser } from "../parser";

export type BranchMap = Map<TokenType, () => Node>;

export function createBranch<T extends Node>(production: () => T, ...tokens: TokenType[]): BranchMap {

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

export function useBranch(parser: Parser, branchTable: BranchMap): Node {

    const production = branchTable.get(parser.peek().tokenType)

    if (production !== undefined) {
        return production()
    }

    return new EmptyNode()
    
}