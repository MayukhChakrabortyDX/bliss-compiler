import { TokenType } from "../../lexer/tokens";
import { EmptyNode } from "../ast";
import { First } from "../first";
import { Parser } from "../parser";
import { branchGroup, createBranch, } from "../utility/branch";
import { createExtension } from "../utility/extension";
import { union } from "../utility/union";


namespace BuiltinType {

    export const first: Set<TokenType> = union(
        TokenType.K_u8, TokenType.K_u16, TokenType.K_u32, TokenType.K_u64,
        TokenType.K_i8, TokenType.K_i16, TokenType.K_i32, TokenType.K_i64,
        TokenType.K_f32, TokenType.K_f64 //that's it for now
    )

    export function parse(parser: Parser, sync: Set<TokenType>) {

        const type = parser.peek()
        if (first.has(type.tokenType)) {

            //well and good
            parser.advance()
            return {
                is: "built-in-type",
                type,
                name: TokenType[type.tokenType]
            }

        }

        //otherwise
        parser.report("Expected a built-in type keyword", type)
        return new EmptyNode("From built-in type")

    }

}

namespace CompositeType {

    export const first = union(TokenType.Identifier)

    const identifierSequenceExtension = createBranch((parser, sync) => {

        parser.advance(); //because we already matched the first token in the branch itself.
        const paths = []

        paths.push(
            parser.digest({
                expected: TokenType.Identifier,
                sync: sync.union(new Set([TokenType.Identifier, TokenType.RBrace, TokenType.Comma])),
                title: "Requires atleast one identifier in brackets"
            })
        )

        while (true) {

            //what token we encounter determines what happens
            const tokenRoot = parser.peek()
            const token = tokenRoot.tokenType

            if (sync.has(token) && token != TokenType.RBrace && token != TokenType.Comma && token != TokenType.Identifier) {

                //we have completed the sync and we have also crossed the delim
                parser.syncToken(false, sync, "Expected a closing ')' bracket", tokenRoot)
                break

            }

            if (token == TokenType.RBrace) {
                //so this is our deliminator
                parser.advance()
                break
            }

            if (token == TokenType.Identifier) {

                //we encounted a new production without using the separator

                //why? because if any previous error occurs, most likely due to separator, we do not report.
                parser.report("Provide a separator, ',' (COMMA) before a name", tokenRoot)

                paths.push(
                    parser.digest({
                        expected: TokenType.Identifier,
                        sync: sync.union(new Set([TokenType.Identifier, TokenType.RBrace, TokenType.Comma])),
                        title: ""
                    })
                )

                continue;
            }

            if (token == TokenType.Comma) {

                //if it's our separator
                parser.advance()
                paths.push(
                    parser.digest({
                        expected: TokenType.Identifier,
                        sync: sync.union(new Set([TokenType.Identifier, TokenType.RBrace, TokenType.Comma])),
                        title: "Expected an identifier for the composite type"
                    })
                )

                continue;

            }

            //otherwise we try to sync and continue. Eventually reaching EOF ofc.
            parser.match({
                expected: TokenType.Comma,
                sync,
                title: "Expected a comma separator, got something else"
            })

        }

        return paths

    }, TokenType.LBrace)

    const identifierExtension = createBranch((parser, sync) => {

        return parser.digest({
            expected: TokenType.Identifier,
            sync,
            title: "Expected an identifier for the composite type"
        })

    }, TokenType.Identifier)

    const btable = branchGroup(identifierExtension, identifierSequenceExtension)

    export function parse(parser: Parser, sync: Set<TokenType>) {

        return parser.useExtension(
            () => {

                const node = parser.digest({
                    expected: TokenType.Identifier,
                    sync: union(sync, TokenType.DoubleColon, TokenType.LBrace, TokenType.Identifier, TokenType.RBrace, TokenType.Comma),
                    title: "Expected an identifier"
                })
                return node

            },

            createExtension((parser, from, sync) => {

                parser.advance()
                const branch = parser.useBranch(btable, "Expected identifier or a sequence of identifiers", sync)

                return {
                    is: "composite-type",
                    from,
                    over: branch
                }

            }, TokenType.DoubleColon),

            sync
        )

    }

}

namespace TypeAtom {

    export const first: Set<TokenType> = union(BuiltinType.first, CompositeType.first, TokenType.Identifier, TokenType.HashSymbol, TokenType.RSquareBrace, TokenType.Backtick)

    const builtinBranch = createBranch((parser, sync) => BuiltinType.parse(parser, sync), ...BuiltinType.first)
    const compositeBranch = createBranch((parser, sync) => CompositeType.parse(parser, sync), ...CompositeType.first)

    const handleTypeBranch = createBranch((parser, sync) => {

        parser.advance()
        return {
            is: "handle-type",
            type: parser.parseType(sync)
        }

    }, TokenType.HashSymbol)

    const referenceTypeBranch = createBranch((parser, sync) => {

        parser.advance()
        return {
            is: "reference-type",
            type: parser.parseType(sync)
        }

    }, TokenType.Backtick)

    const pointerTypeBranch = createBranch((parser, sync) => {

        parser.advance()

        const type = parser.parseType(union(sync, TokenType.RSquareBrace))

        parser.match({
            expected: TokenType.RSquareBrace,
            sync,
            title: "Expected a closing ']' here"
        })

        return {
            is: "pointer-type",
            type
        }

    }, TokenType.LSquareBrace)

    const branchTable = branchGroup(pointerTypeBranch, referenceTypeBranch, builtinBranch, compositeBranch, handleTypeBranch)

    export function parse(parser: Parser, sync: Set<TokenType>) {

        return parser.useBranch(branchTable, "Expected a valid token to start type.", sync)

    }

}

namespace TypeCache {
    //@ts-ignore
    export const arrayExtension = createExtension((parser, from, sync) => {

        parser.advance()
        const value = parser.digest({
            expected: TokenType.Integer,
            sync: sync.union(new Set([TokenType.RSquareBrace])),
            title: "Expected an integer for the fixed sized array type"
        })

        parser.match({
            expected: TokenType.RSquareBrace,
            sync,
            title: "Expected a closing ']' bracket here"
        })

        return parser.useExtension(() => {
            return {

                is: "array-type",
                size: value,
                from

            }
        }, arrayExtension, sync)

    }, TokenType.LSquareBrace)
}

//* VERIFIED AND CACHED
export function parseType(parser: Parser, sync: Set<TokenType>) {

    return parser.useExtension(
        () => {
            return TypeAtom.parse(parser, sync.union(new Set([TokenType.LSquareBrace, TokenType.Integer, TokenType.RSquareBrace])))
        },
        TypeCache.arrayExtension,
        sync
    )

}