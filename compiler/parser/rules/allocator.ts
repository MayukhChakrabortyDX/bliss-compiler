import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import type { Parser } from "../parser";
import { union } from "../utility/union";
import { ParseNode, ParseNodeEnum } from "../utility/parse_node";

export class Allocator extends ParseNode<ParseNodeEnum.Allocator> {
    constructor(public name: string, public functions: ParseNode<ParseNodeEnum.Function>[]) {
        super(ParseNodeEnum.Allocator)
    }
}

export function parseAllocator( parser: Parser, sync: Set<TokenType> ) {

    const finish = parser.start()

    parser.match({
        expected: TokenType.K_Allocator,
        sync: union(sync, First.FunctionProduction, TokenType.RBracket, TokenType.LBracket, TokenType.Identifier),
        title: "Expected the allocator keyword"
    })

    const name = parser.digest({
        expected: TokenType.Identifier,
        sync: union(sync, First.FunctionProduction, TokenType.RBracket, TokenType.LBracket),
        title: "Expected a name for the allocator"
    })

    parser.match({
        expected: TokenType.LBracket,
        sync: union(sync, First.FunctionProduction, TokenType.RBracket),
        title: "Expected a starting '{' here"
    })

    //@ts-ignore
    const body = []

    parser.useLoopWithoutSeparator({
        callback: (fx) => body.push(fx),
        production: (parser, sync) => parser.parseFunction(sync),
        deliminator: TokenType.RBracket,
        first: First.FunctionProduction,
        sync: union(sync, TokenType.RBracket),
        titles: {
            closing: "Expected a '}' bracket to close allocator",
            invalidToken: "Expected start of a function here"
        },
    })

    //@ts-ignore
    return finish(new Allocator(name, body))

}