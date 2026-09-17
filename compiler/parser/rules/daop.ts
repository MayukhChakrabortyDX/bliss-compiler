import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";
import { createExtension, extensionGroup } from "../utility/extension";
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
            },
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

//* VERIFIED 
namespace Data {

    export const first = union(TokenType.K_Data)

    //this is basically extensions and nothing more
    const linearType = createExtension((parser, from: { name: string }, sync) => {

        parser.match({
            expected: TokenType.LBrace,
            sync: union(sync, TokenType.RBrace, First.Type),
            title: "Expected a starting '(' bracket"
        })

        const type = parser.parseType(union(sync, TokenType.RBrace))

        parser.match({
            expected: TokenType.RBrace,
            sync,
            title: "Expected a closing ')' bracket"
        })

        return {
            is: "data",
            kind: "linear",
            name: from.name,
            type
        }

    }, TokenType.LBrace)

    const arrayType = createExtension((parser, from: { name: string }, sync) => {

        parser.match({
            expected: TokenType.LSquareBrace,
            sync: union(sync, TokenType.LSquareBrace, TokenType.Integer, TokenType.Comma, First.Type),
            title: "Expected a starting '[' bracket here"
        })

        const type = parser.parseType(union(sync, TokenType.LSquareBrace, TokenType.Integer, TokenType.Comma))

        parser.match({
            expected: TokenType.Comma,
            sync: union(sync, TokenType.LSquareBrace, TokenType.Integer),
            title: "Expected the separator comma here"
        })

        const size = parser.digest({
            expected: TokenType.Integer,
            sync: union(sync, TokenType.LSquareBrace),
            title: "Expected a size for array data here in integer form"
        })

        parser.match({
            expected: TokenType.RSquareBrace,
            sync,
            title: "Expected a closing ']' bracket here"
        })

        return {
            is: "data",
            kind: "array",
            name: from.name,
            type, size
        }

    }, TokenType.LSquareBrace)

    const structType = createExtension((parser, from: { name: string }, sync) => {

        parser.match({
            expected: TokenType.LBracket,
            sync: union(sync, TokenType.RBracket, TokenType.LBracket, Field.first),
            title: "Expected a starting '{' bracket here"
        })

        //@ts-ignore
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

        return {
            is: "data",
            kind: "struct-like",
            name: from.name,
            //@ts-ignore
            fields
        }

    }, TokenType.LBracket)

    //@ts-ignore
    const extension = extensionGroup(linearType, arrayType, structType)

    export function parse(parser: Parser, sync: Set<TokenType>) {

        let output = parser.useExtension(
            () => {

                parser.match({
                    expected: TokenType.K_Data,
                    sync: union(sync, TokenType.Identifier),
                    title: "Expected the keyword data here"
                })

                const name = parser.digest({
                    expected: TokenType.Identifier,
                    sync,
                    title: "Expected a name for the data"
                })

                return {
                    is: "data",
                    kind: "named-token",
                    name
                }

            },

            extension,
            union(sync, TokenType.Semicolon)
        )

        parser.match({
            expected: TokenType.Semicolon,
            sync,
            title: "Expected a closing semicolon"
        })

        return output

    }

}

//* VERIFIED
namespace Bind {

    export const first = union(TokenType.K_Bind)
    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Bind,
            sync: union(sync, TokenType.RBracket, First.FunctionProduction, TokenType.LBracket, TokenType.Identifier, TokenType.K_As, TokenType.Identifier, TokenType.K_With),
            title: "Expected the keyword bind here"
        })

        const name = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, TokenType.RBracket, First.FunctionProduction, TokenType.LBracket, TokenType.Identifier, TokenType.K_As, TokenType.Identifier, TokenType.K_With),
            title: "Expected the data name to bind with"
        })

        parser.match({
            expected: TokenType.K_With,
            sync: union(sync, TokenType.RBracket, First.FunctionProduction, TokenType.LBracket, TokenType.Identifier, TokenType.K_As, TokenType.Identifier),
            title: "Expected the preposition 'with' here"
        })

        const actionList = []
        //now we branch, and here simple branching will suffice
        if (parser.peek().tokenType == TokenType.Identifier) {

            actionList.push(
                parser.digest({
                    expected: TokenType.Identifier,
                    sync: union(sync, TokenType.RBracket, First.FunctionProduction, TokenType.LBracket, TokenType.Identifier, TokenType.K_As, TokenType.Identifier),
                    title: "Expected an action name here"
                })
            )

        } else {

            parser.match({
                expected: TokenType.LBrace,
                sync: union(sync, TokenType.RBracket, First.FunctionProduction, TokenType.LBracket, TokenType.Identifier, TokenType.K_As, TokenType.Identifier),
                title: "Expected a starting '(' bracket here"
            })
            //then we can have only one option. Nothing else.
            parser.useLoop({
                callback: (action) => actionList.push(action),
                production: (parser, sync) => {
                    return parser.digest({
                        expected: TokenType.Identifier,
                        sync,
                        title: "Expected a name for the action"
                    })
                },
                deliminator: TokenType.RBrace,
                separator: TokenType.Comma,
                first: union(TokenType.Identifier),
                sync: union(sync, TokenType.RBracket, First.FunctionProduction, TokenType.LBracket, TokenType.Identifier, TokenType.K_As),
                titles: {
                    closing: "Expected a ')' as a closing bracket",
                    separator: "Expected a comma separator between action names",
                    separatorMissing: "Expected a comma as a separator"
                }
            })

        }

        parser.match({
            expected: TokenType.K_As,
            sync: union(sync, TokenType.RBracket, First.FunctionProduction, TokenType.LBracket, TokenType.Identifier),
            title: "Expected the preposition 'as' here"
        })

        const bindingName = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, TokenType.RBracket, First.FunctionProduction, TokenType.LBracket),
            title: "Expected a name for the binding"
        })

        parser.match({
            expected: TokenType.LBracket,
            sync: union(sync, TokenType.RBracket, First.FunctionProduction),
            title: "Expected a starting '{' bracket here"
        })

        //@ts-ignore
        const definitions = []

        parser.useLoopWithoutSeparator({
            callback: (def) => definitions.push(def),
            production: (parser, sync) => parser.parseFunction(sync),
            deliminator: TokenType.RBracket,
            sync: union(sync, TokenType.RBracket),
            first: First.FunctionProduction,
            titles: {
                closing: "Expected a '}' bracket instead",
                invalidToken: "Expected a function keyword 'fx' here"
            }
        })

        return {
            is: "bind",
            name,
            actionList,
            bindingName,
            //@ts-ignore
            definitions
        }

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

//* VERIFIED
namespace DAOPCache {

    const dataBranch = createBranch(Data.parse, ...Data.first)
    const actionBranch = createBranch(Action.parse, ...Action.first)
    const bindBranch = createBranch(Bind.parse, ...Bind.first)
    const aliasBranch = createBranch(Alias.parse, ...Alias.first)
    export const branch = branchGroup(dataBranch, actionBranch, bindBranch, aliasBranch)

}

//* VERIFIED
export function parseDaop(parser: Parser, sync: Set<TokenType>) {
    return parser.useBranch(DAOPCache.branch, "Expected daop branch", sync)
}