//* AST VALIDATED

import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import type { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";
import { ParseNode, ParseNodeEnum } from "../utility/parse_node";
import { union } from "../utility/union";

const importBranch = createBranch((parser, sync) => parser.parseImport(sync), ...First.Module.Import)
const usingBranch = createBranch((parser, sync) => parser.parseImport(sync), ...First.Module.Using)
const exportBranch = createBranch((parser, sync) => parser.parseExport(sync), ...First.Module.Export)
const functionBranch = createBranch((parser, sync) => parser.parseFunction(sync), ...First.FunctionProduction)
const allocatorBranch = createBranch((parser, sync) => parser.parseAllocator(sync), ...First.Allocator)
const daopBranch = createBranch((parser, sync) => parser.parseDaop(sync), ...First.DAOP)

const programBranch = branchGroup(importBranch, usingBranch, exportBranch, functionBranch, allocatorBranch, daopBranch)
const first = union(First.Module.Import, First.Module.Using, First.Module.Export, First.FunctionProduction, First.Allocator, First.DAOP)

type BodyType =
    ParseNode<
        ParseNodeEnum.Module |
        ParseNodeEnum.Function |
        ParseNodeEnum.Allocator |
        //daop specific types
        ParseNodeEnum.Alias |
        ParseNodeEnum.Action |
        ParseNodeEnum.DataLayout |
        ParseNodeEnum.Bind
    >

export class Program extends ParseNode<ParseNodeEnum.Program> {
    constructor(public body: BodyType[], public filename: string) {
        super(ParseNodeEnum.Program)
    }
}
//* VERIFIED AND CACHED
export function parseProgramProduction(parser: Parser, filename: string) {

    const finish = parser.start()

    const nodes: BodyType[] = []

    if (parser.peek().tokenType != TokenType.EOF) {

        parser.useLoopWithoutSeparator({
            callback: (item: BodyType) => nodes.push(item),
            production: (parser, sync) => parser.useBranch(programBranch, "Expected a valid token", sync),
            deliminator: TokenType.EOF,
            sync: union(TokenType.EOF),
            first,
            titles: {
                closing: "",
                invalidToken: "Invalid program body token"
            },
        })

        //because the loop advances one step, so consume a virtual "out of bounds" token to revert to the original.
        parser.consume(-1)

    }

    return finish(
        new Program(nodes, filename)
    )

}