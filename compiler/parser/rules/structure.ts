import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import { Parser } from "../parser";
import { branchGroup, createBranch, useBranch } from "../utility/branch";
import { union } from "../utility/union";

namespace StructureCache {

    const fxBranch = createBranch((parser, sync) => parser.parseFunction(sync), ...First.FunctionProduction)
    const loopBranch = createBranch((parser, sync) => parser.parseLoop(sync), ...First.LoopProduction)
    const conditionBranch = createBranch((parser, sync) => parser.parseCondition(sync), ...First.Condition)

    export const branch = branchGroup(fxBranch, loopBranch, conditionBranch)

}

//* VERIFIED AND CACHED
export function parseStructure(parser: Parser, sync: Set<TokenType>) {

    return useBranch(parser, StructureCache.branch, "Expected a valid start to a structural token", sync)

}

namespace BodyCache {
    const structure = createBranch((parser, sync) => parser.parseStructure(sync), ...First.Structure.Structure)
    const node = createBranch((parser, sync) => {

        const node = parser.parseNode(union(sync, TokenType.Semicolon))
        parser.match({
            expected: TokenType.Semicolon,
            sync,
            title: "expected a closing semicolon here"
        })

        return node

    }, ...First.Node)

    export const branch = branchGroup(structure, node)
}

//* VERIFIED AND CACHED
export function parseBody(parser: Parser, sync: Set<TokenType>, belongs: string) {

    parser.match({
        expected: TokenType.LBracket,
        sync,
        title: `${belongs} body must start with '{'`
    })

    //now is the test
    //@ts-ignore
    const body = []

    if (parser.peek().tokenType != TokenType.RBracket) {
        parser.useLoopWithoutSeparator({
            callback: (item) => body.push(item),
            production: (parser, sync) => useBranch(parser, BodyCache.branch, "Expected a valid structure token", sync),
            deliminator: TokenType.RBracket,
            first: union(First.Node, First.Structure.Structure),
            sync: union(sync, TokenType.RBracket),
            titles: {
                closing: "Expected a '}' as a closing bracket",
                invalidToken: `Unexpected token inside ${belongs} body`
            }

        })
    } else {
        parser.advance()
    }

    //@ts-ignore
    return body

}