import { TokenType } from "../../lexer/tokens";
import type { Parser } from "../parser";
import { branchGroup, createBranch, useBranch } from "../utility/branch";
import { createExtension } from "../utility/extension";
import { union } from "../utility/union";
import { Node } from "./node";
import { Type } from "./types";

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
    export const first = Type.first
    export function parse(parser: Parser, sync: Set<TokenType>) {

        const type = Type.parse(parser, union(sync, TokenType.Identifier))
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

export namespace HeadProduction {
    export const first: Set<TokenType> = union(TokenType.K_Fx)
    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Fx,
            sync: union(sync, Type.first, TokenType.RBrace, Args.first, TokenType.LBrace, TokenType.Identifier),
            title: "Expected keyword 'fx'"
        })

        const name = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, Type.first, TokenType.RBrace, Args.first, TokenType.LBrace),
            title: "Name of the function expected, found something else"
        })

        parser.match({
            expected: TokenType.LBrace,
            sync: union(sync, Type.first, TokenType.RBrace, Args.first),
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
                sync: union(sync, Type.first, TokenType.RBrace),
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
            sync: union(sync, Type.first),
            title: "Use a colon to indicate return type"
        })

        const type = Type.parse(parser, sync)

        return {
            is: "function-head",
            name,
            //@ts-ignore
            argList,
            returnType: type
        }

    }
}

export namespace BodyProduction {

    export const first: Set<TokenType> = union(TokenType.LBracket)

    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.LBracket,
            sync,
            title: "Function body must start with '{'"
        })

        //now is the test
        //@ts-ignore
        const body = []

        if (parser.peek().tokenType != TokenType.RBracket) {
            parser.useLoopWithoutSeparator({
                callback: (item) => body.push(item),
                production: (parser, sync) => {

                    const node = Node.parse(parser, union(sync, TokenType.Semicolon))
                    parser.match({
                        expected: TokenType.Semicolon,
                        sync,
                        title: "expected a closing semicolon here"
                    })

                    return node

                },
                deliminator: TokenType.RBracket,
                first: Node.first,
                sync: union(sync, TokenType.RBracket),
                titles: {
                    closing: "Expected a '}' as a closing bracket",
                    invalidToken: "Unexpected token inside function body"
                }

            })
        } else {
            parser.advance()
        }

        //! WE MISSED THE STRUCTURE FOR NOW, WHICH WE WILL INTEGRATE LATER ON.


        //@ts-ignore
        return body

    }
}

export namespace FunctionProduction {
    //rule: FUNCTION -> HEAD BODY;
    export const first: Set<TokenType> = HeadProduction.first
    export function parse(parser: Parser, sync: Set<TokenType>) {

        const head = HeadProduction.parse(parser, union(sync, BodyProduction.first))
        const body = BodyProduction.parse(parser, sync)

        return {
            is: "function",
            head, body
        }

    }
}