import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import type { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";
import { union } from "../utility/union";

//* VERIFIED
namespace Action {

    export const first = union(TokenType.K_Action)
    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Action,
            sync: union(sync, First.FunctionHead, TokenType.Semicolon, TokenType.RBracket, TokenType.LBracket, TokenType.Identifier),
            title: "Expected the keword action here"
        })

        const name = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, First.FunctionHead, TokenType.Semicolon, TokenType.RBracket, TokenType.LBracket),
            title: "Expected a name for the action here"
        })

        parser.match({
            expected: TokenType.LBracket,
            sync: union(sync, First.FunctionHead, TokenType.Semicolon, TokenType.RBracket),
            title: "Expected a '{' to start the action body"
        })

        //@ts-ignore
        const body = []

        parser.useLoopWithoutSeparator({
            callback: (item) => body.push(item),
            production: ((parser, sync) => {

                const head = parser.parseFunctionHead(sync)
                parser.match({
                    expected: TokenType.Semicolon,
                    sync,
                    title: "Expected a semicolon here"
                })

            }),
            deliminator: TokenType.RBracket,
            first: First.FunctionHead,
            sync: union(sync, TokenType.RBracket),
            titles: {
                closing: "Expected a closing '}' bracket here",
                invalidToken: "Should have been a function head 'fx'"
            }
        })

        return {
            is: "action-definition",
            name,
            //@ts-ignore
            body
        }

    }

}

//* VERIFIED
namespace Field {
    export const first = union(First.Type)
    export function parse(parser: Parser, sync: Set<TokenType>) {

        const type = parser.parseType(union(sync, TokenType.Identifier, TokenType.Semicolon))
        const name = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, TokenType.Semicolon),
            title: "Expected a name for the data field"
        })

        parser.match({
            expected: TokenType.Semicolon,
            sync,
            title: "Expected a semicolon here"
        })

        return {
            is: "data-field",
            type,
            name
        }

    }
}

namespace Data {

    export const first = union(TokenType.K_Data)

    //this is basically extensions and nothing more
    const linearType = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.LBrace,
            sync,
            title: "Expected a starting '(' bracket"
        })

        const type = parser.parseType(sync)

        parser.match({
            expected: TokenType.RBrace,
            sync,
            title: "Expected a closing ')' bracket"
        })

    }, TokenType.LBrace)

    const arrayType = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.LSquareBrace,
            sync,
            title: ""
        })

        const type = parser.parseType(sync)
        parser.match({
            expected: TokenType.Comma,
            sync,
            title: ""
        })
        const size = parser.digest({
            expected: TokenType.Integer,
            sync,
            title: ""
        })

        parser.match({
            expected: TokenType.LSquareBrace,
            sync,
            title: ""
        })

    }, TokenType.LSquareBrace)

    const structType = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.LBracket,
            sync,
            title: ""
        })

        const fields = []

        parser.useLoopWithoutSeparator({
            callback: (field) => fields.push(field),
            production: (parser, sync) => Field.parse(parser, sync),
            deliminator: TokenType.RBracket,
            sync: union(sync, TokenType.RBracket),
            first: Field.first,
            titles: {
                closing: "Expected  '}' closing bracket",
                invalidToken: "Unexpeted token used here"
            }
        })

    }, TokenType.LBracket)

    export function parse(parser: Parser, sync: Set<TokenType>) {

    }

}

namespace Bind {

    export const first = union(TokenType.K_Bind)
    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Bind,
            sync,
            title: ""
        })

        const name = parser.digest({
            expected: TokenType.Identifier,
            sync,
            title: ""
        })

        parser.match({
            expected: TokenType.K_With,
            sync,
            title: ""
        })

        //now we branch

    }

}

//* VERIFIED
namespace Alias {
    export const first = union(TokenType.K_Alias)
    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Alias,
            sync: union(sync, First.Type, TokenType.K_As, TokenType.Identifier, TokenType.Semicolon),
            title: "Expected the keyword alias"
        })

        const type = parser.parseType(
            union(sync, TokenType.K_As, TokenType.Identifier, TokenType.Semicolon)
        )

        parser.match({
            expected: TokenType.K_As,
            sync: union(sync, TokenType.Identifier, TokenType.Semicolon),
            title: "Expected the token 'as'"
        })

        const name = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, TokenType.Semicolon),
            title: "Expected the name of the alias here"
        })

        parser.match({
            expected: TokenType.Semicolon,
            sync,
            title: "Expected a semicolon"
        })

        return {
            is: 'alias',
            type,
            name
        }

    }
}

namespace DAOPCache {

    const dataBranch = createBranch(Data.parse, ...Data.first)
    const actionBranch = createBranch(Action.parse, ...Action.first)
    const bindBranch = createBranch(Bind.parse, ...Bind.first)
    const aliasBranch = createBranch(Alias.parse, ...Alias.first)
    export const branch = branchGroup(dataBranch, actionBranch, bindBranch, aliasBranch)

}

export function parseDaop(parser: Parser, sync: Set<TokenType>) {
    return parser.useBranch(DAOPCache.branch, "Expected daop branch", sync)
}