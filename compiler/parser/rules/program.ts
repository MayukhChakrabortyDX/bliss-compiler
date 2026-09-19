import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import type { Parser } from "../parser";
import { branchGroup, createBranch, useBranch } from "../utility/branch";
import { ParseNode, ParseNodeEnum } from "../utility/parse_node";
import { union } from "../utility/union";

const importBranch = createBranch((parser, sync) => parser.parseImport(sync), ...First.Module.Import)
const usingBranch = createBranch((parser, sync) => parser.parseImport(sync), ...First.Module.Using)
const functionBranch = createBranch((parser, sync) => parser.parseFunction(sync), ...First.FunctionProduction)
const allocatorBranch = createBranch((parser, sync) => parser.parseAllocator(sync), ...First.Allocator)
const daopBranch = createBranch((parser, sync) => parser.parseDaop(sync), ...First.DAOP)

const programBranch = branchGroup(importBranch, usingBranch, functionBranch, allocatorBranch, daopBranch)
const first = union(First.Module.Import, First.Module.Using, First.FunctionProduction, First.Allocator, First.DAOP)

export class Program extends ParseNode<ParseNodeEnum.Program> {
    constructor(public body: any, public filename: string) {
        super(ParseNodeEnum.Program)
    }
}
//* VERIFIED AND CACHED
export function parseProgramProduction(parser: Parser, filename: string) {

    const finish = parser.start()
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
    return finish(
        new Program(nodes, filename)
    )

}