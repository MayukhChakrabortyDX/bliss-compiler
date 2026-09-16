import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import { Parser } from "../parser";
import { branchGroup, createBranch, useBranch } from "../utility/branch";
import { createExtension } from "../utility/extension";
import { union } from "../utility/union";

namespace Action {

    export const first = union(TokenType.K_With)

    const multipleActions = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.LBrace,
            sync: union(sync, TokenType.Identifier, TokenType.Comma, TokenType.RBrace),
            title: "Expected a starting '(' bracket"
        })

        //@ts-ignore
        const actions = []

        parser.useLoop({
            callback: (item: string) => actions.push(item),
            production: (parser, sync) => parser.digest({
                expected: TokenType.Identifier,
                sync,
                title: "Expected an identifier"
            }),
            deliminator: TokenType.RBrace,
            separator: TokenType.Comma,
            first: union(TokenType.Identifier),
            titles: {
                closing: "Expected a closing ')' bracket",
                separator: "Expected a comma separator before the action",
                separatorMissing: "Give a separator."
            },
            sync
        })

        return {
            //@ts-ignore
            actions
        }

    }, TokenType.LBrace)

    const singleAction = createBranch((parser, sync) => {

        return {
            actions: [
                parser.digest({
                    expected: TokenType.Identifier,
                    sync,
                    title: "Expected an identifier here"
                })
            ]
        }

    }, TokenType.Identifier)

    const branchTable = branchGroup(singleAction, multipleActions)

    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_With,
            sync: union(TokenType.RBrace, TokenType.Identifier, TokenType.LBrace, sync),
            title: "Expected the 'with' keyword"
        })

        const output = parser.useBranch(branchTable, "Expected a valid action token", sync)

        return {
            is: "action-type",
            ...output
        }

    }

}

namespace Typed {
    export const first = First.Type
    export function parse(parser: Parser, sync: Set<TokenType>) {

        const type = parser.parseType(union(sync, TokenType.Identifier))
        const name = parser.digest({
            expected: TokenType.Identifier,
            sync,
            title: "Expected an identifier"
        })

        return {
            is: "typed",
            type,
            name
        }

    }
}

namespace Composite {
    export const first = Typed.first
    export function parse(parser: Parser, sync: Set<TokenType>) {

        const typed = Typed.parse(parser, union(sync, Action.first))
        const action = Action.parse(parser, sync)

        return {
            is: "composite",
            typed,
            action
        }

    }
}

namespace Args {
    export const first = union(Typed.first, Composite.first, TokenType.Identifier)

    const actionExtension = createExtension((parser, from, sync) => {

        const action = Action.parse(parser, sync)
        return {
            is: "typed_action",
            from,
            action
        }

    }, ...Action.first)

    export function parse(parser: Parser, sync: Set<TokenType>) {

        return parser.useExtension(
            () => Typed.parse(parser, sync),
            actionExtension,
            sync
        )
    }
}

//* VERIFIED AND CACHED
export function parseFunctionHead(parser: Parser, sync: Set<TokenType>) {

    parser.match({
        expected: TokenType.K_Fx,
        sync: union(sync, Args.first, TokenType.RBrace, Args.first, TokenType.LBrace, TokenType.Identifier),
        title: "Expected keyword 'fx'"
    })

    const name = parser.digest({
        expected: TokenType.Identifier,
        sync: union(sync, Args.first, TokenType.RBrace, Args.first, TokenType.LBrace),
        title: "Name of the function expected, found something else"
    })

    parser.match({
        expected: TokenType.LBrace,
        sync: union(sync, Args.first, TokenType.RBrace, Args.first),
        title: "Arguments must start with '('"
    })

    //@ts-ignore
    const argList = []

    if (parser.peek().tokenType != TokenType.RBrace) {

        parser.useLoop({
            callback: (args) => argList.push(args),
            production: Args.parse,
            separator: TokenType.Comma,
            deliminator: TokenType.RBrace,
            sync: union(sync, First.Type, TokenType.RBrace),
            first: Args.first,
            titles: {
                separator: "Expected a comma before next argument",
                closing: "Expected a ')' to close the argList",
                separatorMissing: "Expected a comma as a separator"
            }
        })

    } else {
        parser.advance()
    }

    parser.match({
        expected: TokenType.Colon,
        sync: union(sync, First.Type),
        title: "Use a colon to indicate return type"
    })

    const type = parser.parseType(sync)

    return {
        is: "function-head",
        name,
        //@ts-ignore
        argList,
        returnType: type
    }

}

//* VERIFIED AND CACHED
export function parseFunction(parser: Parser, sync: Set<TokenType>) {

    const head = parser.parseFunctionHead(union(sync, First.Structure.Body))
    const body = parser.parseBody(sync, "function")

    return {
        is: "function",
        head, body
    }

}