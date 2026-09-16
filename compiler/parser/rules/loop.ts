import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import type { Parser } from "../parser";
import { union } from "../utility/union";

//* VERIFIED AND CACHED
export function parseLoop(parser: Parser, sync: Set<TokenType>) {

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

    return {
        is: "loop",
        name,
        body
    }

}