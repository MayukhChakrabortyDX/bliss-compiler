import { TokenType } from "../../lexer/tokens";
import type { Parser } from "../parser";

export namespace LoopProduction {

    export const first: Set<TokenType> = new Set([ TokenType.K_Loop ])
    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Loop,
            sync: sync.union(new Set([ TokenType.Identifier, TokenType.LBracket, TokenType.RBracket ])),
            title: "Expected the loop keyword"
        })

        let name: string = "";

        if ( parser.peek().tokenType == TokenType.Identifier ) {

            name = parser.digest({
                expected: TokenType.Identifier,
                sync: sync.union(new Set([ TokenType.LBracket, TokenType.RBracket ])),
                title: "Expected a name for the loop"
            })

        }

        parser.match({
            expected: TokenType.LBracket,
            sync: sync.union(new Set([ TokenType.RBracket ])),
            title: "Expected the loop body to start with '{'"
        })

        //some structure to capture later on
        //! STRUCTURAL CAPTURES STILL PENDING.

        parser.match({
            expected: TokenType.RBracket,
            sync,
            title: "Expected the loop body to end with '}'"
        })

        return {
            is: "loop",
            name,
            body: []
        }

    }

}