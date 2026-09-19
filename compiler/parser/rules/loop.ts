import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import type { Parser } from "../parser";
import { ParseNode, ParseNodeEnum } from "../utility/parse_node";
import { union } from "../utility/union";

export class Loop extends ParseNode<ParseNodeEnum.Loop> {
    constructor(public name: string, public body: ParseNode<ParseNodeEnum.BlockBody>) {
        super(ParseNodeEnum.Loop)
    }
}
//* VERIFIED AND CACHED
export function parseLoop(parser: Parser, sync: Set<TokenType>) {

    const finish = parser.start()
    parser.match({
        expected: TokenType.K_Loop,
        sync: union(sync, TokenType.Identifier, First.Structure.Body),
        title: "Expected the loop keyword"
    })

    let name: string = "";

    if (parser.peek().tokenType == TokenType.Identifier) {

        name = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, First.Structure.Body),
            title: "Expected a name for the loop"
        })

    }

    const body = parser.parseBody(sync, "loop")

    return finish(new Loop(name, body))

}