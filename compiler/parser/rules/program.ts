import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import type { Parser } from "../parser";
import { branchGroup, createBranch, useBranch } from "../utility/branch";
import { union } from "../utility/union";

const importBranch = createBranch((parser, sync) => parser.parseImport(sync), ...First.Module.Import)
const usingBranch = createBranch((parser, sync) => parser.parseImport(sync), ...First.Module.Using)
const functionBranch = createBranch((parser, sync) => parser.parseFunction(sync), ...First.FunctionProduction)
const allocatorBranch = createBranch((parser, sync) => parser.parseAllocator(sync), ...First.Allocator)
const daopBranch = createBranch((parser, sync) => parser.parseDaop(sync), ...First.DAOP)

const programBranch = branchGroup(importBranch, usingBranch, functionBranch, allocatorBranch, daopBranch)
const first = union(First.Module.Import, First.Module.Using, First.FunctionProduction, First.Allocator, First.DAOP)

//* VERIFIED AND CACHED
export function parseProgramProduction(parser: Parser) {

    //@ts-ignore
    const nodes = []

    if (parser.peek().tokenType != TokenType.EOF) {

        parser.useLoopWithoutSeparator({
            callback: (item) => nodes.push(item),
            production: (parser, sync) => parser.useBranch(programBranch, "Expected a valid token", sync),
            deliminator: TokenType.EOF,
            sync: union(TokenType.EOF),
            first,
            titles: {
                closing: "",
                invalidToken: "Invalid program body token"
            },
        })

    } else {

        parser.advance()

    }

    //@ts-ignore
    return nodes

}