//! NEEDS AST AND GRAMMAR VERIFICATION

import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";
import { createExtension, extensionGroup } from "../utility/extension";
import { digest, token } from "../utility/linear";
import { ParseNode, ParseNodeEnum } from "../utility/parse_node";
import { union } from "../utility/union";

export enum ArgType {
    Typed, Composite
}

export class Argument<T extends ArgType> extends ParseNode<ParseNodeEnum.ArgList> {
    constructor(
        public argKind: T,
        public body:
            T extends ArgType.Typed ?
            {
                name: string, type: ParseNode<ParseNodeEnum.DataType>
            } :
            {
                name: string, type: ParseNode<ParseNodeEnum.DataType>, actions: string[]
            }
    ) {
        super(ParseNodeEnum.ArgList)
    }
}

namespace Action {

    export const first = union(TokenType.K_With)

    const multipleActions = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.LBrace,
            sync: union(sync, TokenType.Identifier, TokenType.Comma, TokenType.RBrace),
            title: "Expected a starting '(' bracket"
        })

        const actions: string[] = []

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
            sync: union(sync, TokenType.RBrace)
        })

        return {
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

        return output

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

        return new Argument(ArgType.Typed, {
            name, type
        })

    }
}

namespace Composite {
    export const first = Typed.first
    export function parse(parser: Parser, sync: Set<TokenType>) {

        const typed: Argument<ArgType.Typed> = Typed.parse(parser, union(sync, Action.first))
        const action = Action.parse(parser, sync)

        return new Argument(ArgType.Composite, {
            name: typed.body.name,
            type: typed.body.type,
            actions: action
        })

    }
}

namespace Args {
    export const first = union(Typed.first, Composite.first, TokenType.Identifier)

    const actionExtension = createExtension((parser, from: Argument<ArgType.Typed>, sync) => {

        const action = Action.parse(parser, sync)
        return new Argument(ArgType.Composite, {
            name: from.body.name,
            type: from.body.type,
            actions: action
        })

    }, ...Action.first)

    export function parse(parser: Parser, sync: Set<TokenType>): Argument<ArgType> {

        return parser.useExtension(
            () => Typed.parse(parser, sync),
            actionExtension,
            sync
        )

    }
}

export class FunctionHead extends ParseNode<ParseNodeEnum.FunctionHead> {
    constructor(public name: string, public args: Argument<ArgType>[], public returnType: ParseNode<ParseNodeEnum.DataType>) {
        super(ParseNodeEnum.FunctionHead)
    }
}
//* VERIFIED AND CACHED
export function parseFunctionHead(parser: Parser, sync: Set<TokenType>) {

    parser.match({
        expected: TokenType.K_Fx,
        sync: union(sync, Args.first, TokenType.RBrace, TokenType.Colon, First.Type, TokenType.LBrace, TokenType.Identifier),
        title: "Expected keyword 'fx'"
    })

    const name = parser.digest({
        expected: TokenType.Identifier,
        sync: union(sync, Args.first, TokenType.RBrace, TokenType.Colon, First.Type, TokenType.LBrace),
        title: "Name of the function expected, found something else"
    })

    parser.match({
        expected: TokenType.LBrace,
        sync: union(sync, Args.first, TokenType.RBrace, TokenType.Colon, First.Type),
        title: "Arguments must start with '('"
    })

    const argList: Argument<ArgType>[] = []

    if (parser.peek().tokenType != TokenType.RBrace) {

        parser.useLoop({
            callback: (args: Argument<ArgType>) => argList.push(args),
            production: Args.parse,
            separator: TokenType.Comma,
            deliminator: TokenType.RBrace,
            sync: union(sync, First.Type, TokenType.RBrace, TokenType.Colon),
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
    return new FunctionHead(name, argList, type)
}

export enum FunctionKindEnum {
    Normal, Linked, ManualLink
}

export class Function<T extends FunctionKindEnum> extends ParseNode<ParseNodeEnum.Function> {
    constructor(
        public functionKind: T,
        public head: ParseNode<ParseNodeEnum.FunctionHead>,
        public body:
            T extends FunctionKindEnum.Normal ? ParseNode<ParseNodeEnum.BlockBody> :
            T extends FunctionKindEnum.Linked ? string :
            null
    ) {
        super(ParseNodeEnum.Function)
    }
}

namespace FunctionCache {

    export const first = union(First.Structure.Body, TokenType.K_Mlink, TokenType.K_Link)
    const bodyExtension = createBranch((parser, sync) => {

        const body = parser.parseBody(sync, "function")
        return { is: "normal", body }

    }, ...First.Structure.Body)

    const linkExtension = createBranch((parser, sync) => {
        
        const output = parser.terminal<{ "pathname": string }>(
            sync,
            "fxLE",
            token(TokenType.K_Link, "Expected the keyword link"),
            token(TokenType.LBrace, "Expected starting '('"),
            digest(TokenType.String, "Expected a linker path", "pathname"),
            token(TokenType.RBrace, "Expected a closing ')' bracket"),
            token(TokenType.Semicolon, "Expected a semicolon")
        )

        return { is: "link", path: output.pathname }

    }, TokenType.K_Link)

    const manualLinkExtension = createBranch((parser, sync) => {

        parser.terminal(
            sync,
            "fxMLE",
            token(TokenType.K_Mlink, "Expected the keword mlink"),
            token(TokenType.Semicolon, "Expected a semicolon token here")
        )

        return { is: "mlink" }

    }, TokenType.K_Mlink)

    export const functionBranchTable = branchGroup(bodyExtension, manualLinkExtension, linkExtension)
}
//* VERIFIED AND CACHED
export function parseFunction(parser: Parser, sync: Set<TokenType>) {

    const head = parser.parseFunctionHead(union(sync, FunctionCache.first))
    const then = parser.useBranch(
        FunctionCache.functionBranchTable,
        "Expected a valid start to function definition",
        sync
    )

    switch (then.is) {
        case "normal":
            return new Function(FunctionKindEnum.Normal, head, then.body)
        case "link":
            return new Function(FunctionKindEnum.Linked, head, then.path)
        default:
            return new Function(FunctionKindEnum.ManualLink, head, null)
    }

}