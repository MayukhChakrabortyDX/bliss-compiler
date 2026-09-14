import { TokenType } from "../../lexer/tokens";
import { Identifier, Node, NodeType } from "../ast";
import type { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";

export namespace ModuleAtom {

    const identifierBranch = createBranch((parser, sync) => {

        const name = parser.digest({
            expected: TokenType.Identifier,
            sync,
            title: "Expected an indentifier"
        })

        return new Identifier(name)

    }, TokenType.Identifier)

    export class Path extends Node {
        constructor(public paths: Node[]) {
            super(NodeType.IncludePath)
        }
    }

    const enclosedBracketBranch = createBranch((parser, sync) => {

        parser.advance(); //because we already matched the first token in the branch itself.
        const paths = []

        paths.push(
            ModulePath.parse(parser, sync.union(new Set([TokenType.Comma, TokenType.RBrace]).union(ModulePath.first)))
        )

        while (true) {

            //what token we encounter determines what happens
            const tokenRoot = parser.peek()
            const token = tokenRoot.tokenType

            if (sync.has(token) && token != TokenType.RBrace && token != TokenType.Comma && !ModulePath.first.has(token)) {

                //we have completed the sync and we have also crossed the delim
                parser.syncToken(false, sync, "Expected a closing ')' bracket", tokenRoot)
                break

            }

            if (token == TokenType.RBrace) {
                //so this is our deliminator
                parser.advance()
                break
            }

            if (ModulePath.first.has(token)) {

                //we encounted a new production without using the separator

                //why? because if any previous error occurs, most likely due to separator, we do not report.
                parser.report("Provide a separator, '.' (DOT) or ',' (COMMA) before a path", tokenRoot)

                paths.push(
                    ModulePath.parse(
                        parser, sync.union(ModulePath.first).union(new Set([TokenType.RBrace, TokenType.Comma])) //the end sync ofc.
                    )
                )

                continue;
            }

            if (token == TokenType.Comma) {

                //if it's our separator
                parser.advance()
                paths.push(
                    ModulePath.parse(
                        parser, sync.union(ModulePath.first).union(new Set([TokenType.RBrace, TokenType.Comma])) //the end sync ofc.
                    )
                )

                continue;

            }

            //otherwise we try to sync and continue. Eventually reaching EOF ofc.
            parser.match({
                expected: TokenType.Comma,
                sync: sync.union(new Set([TokenType.RBrace])).union(ModulePath.first),
                title: "Expected a comma separator, got something else"
            })

        }

        return new Path(paths)

    }, TokenType.LBrace)

    export class IncludeAllNode extends Node {
        constructor() {
            super(NodeType.IncludeAllPath)
        }
    }

    const asteriskBranch = createBranch((parser, sync) => {

        //the reason is simple because this branch was even selected.
        parser.advance()
        return new IncludeAllNode()

    }, TokenType.Multiply)

    const branch = branchGroup(identifierBranch, enclosedBracketBranch, asteriskBranch)

    export const first: Set<TokenType> = new Set([TokenType.Identifier, TokenType.LBrace, TokenType.Multiply])
    export function parse(parser: Parser, sync: Set<TokenType>) {

        return parser.useBranch(
            branch,
            "Expected an identifier, or a '*' or a starting '(' bracket",
            sync //whatever the external sync token happens to be
        )

    }
}

export namespace ModulePath {
    export class ModulePathNode extends Node {
        constructor(public node: Node, public next: Node) {
            super(NodeType.IncludePath)
        }
    }

    export const first: Set<TokenType> = ModuleAtom.first;
    export function parse(parser: Parser, sync: Set<TokenType>): Node {

        let left = ModuleAtom.parse(
            parser,
            sync.union(new Set([TokenType.Dot])) //locally reachable only
        )

        if (parser.peek().tokenType == TokenType.Dot) {

            parser.advance()
            left = new ModulePathNode(
                left, ModulePath.parse(parser, sync)
            )

        }

        return left

    }

}

export namespace ImportProduction {

    export class ImportNode extends Node {
        constructor(public node: Node) {
            super(NodeType.Import)
        }
    }

    export const first: Set<TokenType> = new Set([TokenType.K_Import])

    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Import,
            sync: sync.union(new Set([TokenType.Semicolon])).union(ModulePath.first),
            title: "Expected the keyword 'import'"
        })

        const body = ModulePath.parse(
            parser,
            sync.union(new Set([TokenType.Semicolon])),
        )

        parser.match({
            expected: TokenType.Semicolon,
            sync: sync,
            title: "Expected a semicolon token" //because this is the end token
        })

        return new ImportNode(body)
    }

}

export namespace UsingProduction {
    export class UsingNode extends Node {
        constructor(public node: Node) {
            super(NodeType.Using)
        }
    }

    export const first: Set<TokenType> = new Set([TokenType.K_Using])

    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Using,
            sync: sync.union(new Set([TokenType.Semicolon])).union(ModulePath.first),
            title: "Expected the keyword 'import'"
        })

        const body = ModulePath.parse(
            parser,
            sync.union(new Set([TokenType.Semicolon])),
        )

        parser.match({
            expected: TokenType.Semicolon,
            sync: sync,
            title: "Expected a semicolon token" //because this is the end token
        })

        return new UsingNode(body)
    }

}