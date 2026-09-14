//the strongest that I am going to attempt now.
import { TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";
import { createExtension, extensionGroup, useExtension } from "../utility/extension";
import { union } from "../utility/union";
import { Modifier } from "./modifiers";
import { Type } from "./types";

export namespace Atom {

    const identifierBranch = createBranch((parser, sync) => {

        const identifier = parser.digest({
            expected: TokenType.Identifier,
            sync,
            title: "Expected an identifier"
        })

        return identifier

    }, TokenType.Identifier)

    const integerBranch = createBranch((parser, sync) => {

        const number = parser.digest({
            expected: TokenType.Integer,
            sync,
            title: "Expected an integer"
        })

        return number

    }, TokenType.Integer)

    const realNumBranch = createBranch((parser, sync) => {

        const number = parser.digest({
            expected: TokenType.RealNumber,
            sync,
            title: "Expected a real number"
        })

        return number

    }, TokenType.RealNumber)

    const stringBranch = createBranch((parser, sync) => {

        const str = parser.digest({
            expected: TokenType.String,
            sync,
            title: "Expected a string"
        })

        return str

    }, TokenType.String)

    const bracketNodeBranch = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.LBrace,
            sync: sync.union(Node.first).union(new Set([TokenType.RBrace])),
            title: "Expected a starting bracket '('"
        })

        const node = Node.parse(parser, sync.union(new Set([TokenType.RBrace])))

        parser.match({
            expected: TokenType.RBrace,
            sync,
            title: "Expected a closing bracket ')'"
        })

        return node

    }, TokenType.LBrace)

    const referenceAtomBranch = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.Backtick,
            sync: sync.union(Atom.first),
            title: "Expected a backtick"
        })

        const atom = Atom.parse(parser, sync)

        return {
            is: "reference",
            of: atom
        }

    }, TokenType.Backtick)


    const addressAtomBranch = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.K_Adrs,
            sync: sync.union(Atom.first),
            title: "Expected token 'adrs'"
        })

        const atom = Atom.parse(parser, sync)

        return {
            is: "address_of",
            of: atom
        }

    }, TokenType.K_Adrs)

    const sizeAtomBranch = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.K_Sizeof,
            sync: sync.union(Atom.first),
            title: "Expected token 'sizeof'"
        })

        const atom = Atom.parse(parser, sync)

        return {
            is: "size_of",
            of: atom
        }

    }, TokenType.K_Sizeof)

    const pointerAccessBranch = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.LSquareBrace,
            sync: sync.union(new Set([TokenType.StraightBar, TokenType.RBrace])),
            title: "Expected a starting '[' bracket"
        })

        const center = useExtension(
            parser,
            () => Node.parse(parser, sync),
            createExtension((parser, from, sync) => {

                parser.advance() //straight bar is known, no need to repeat.
                const node = Node.parse(parser, sync.union(new Set([TokenType.RBrace])))

                return {

                    is: "pointer-access",
                    left: from,
                    right: node

                }

            }, TokenType.StraightBar),
            sync
        )

        parser.match({
            expected: TokenType.RSquareBrace,
            sync,
            title: "Expected an ending ']' bracket"
        })

        return {
            is: "pointer-access",
            of: center
        }

    }, TokenType.LSquareBrace)

    const handleAccessBranch = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.HashSymbol,
            sync: sync.union(new Set([TokenType.LSquareBrace, TokenType.StraightBar, TokenType.RBrace])),
            title: "Expected a hash symbol to start with"
        })

        parser.match({
            expected: TokenType.LSquareBrace,
            sync: sync.union(new Set([TokenType.StraightBar, TokenType.RBrace])),
            title: "Expected a starting '[' bracket"
        })

        const center = useExtension(
            parser,
            () => Node.parse(parser, sync),
            createExtension((parser, from, sync) => {

                parser.advance() //straight bar is known, no need to repeat.
                const node = Node.parse(parser, sync.union(new Set([TokenType.RBrace])))

                return {

                    is: "handle-pointer-access",
                    left: from,
                    right: node

                }

            }, TokenType.StraightBar),
            sync
        )

        parser.match({
            expected: TokenType.RSquareBrace,
            sync,
            title: "Expected an ending ']' bracket"
        })

        return {

            is: "handle-pointer-access",
            of: center

        }


    }, TokenType.HashSymbol)

    const branch = branchGroup(handleAccessBranch, pointerAccessBranch, sizeAtomBranch, addressAtomBranch, referenceAtomBranch, identifierBranch, realNumBranch, integerBranch, stringBranch, bracketNodeBranch)

    export const first: Set<TokenType> = Parser.productions.atom.first

    //huge ammounts of 'first' is present here. and all of them are branches
    //oh my god lol.
    export function parse(parser: Parser, sync: Set<TokenType>) {
        return parser.useBranch(
            branch,
            "Invalid expression start token",
            sync
        )
    }

}

// BINDING -> DecideArrayOrCall ('::' DecideArrayOrCall)*;
// MAGNETIC -> BINDING ('->' BINDING)*;
// ACCESS -> MAGNETIC ('.' MAGNETIC)*;
// PRODUCT -> ACCESS (('*' | '/') ACCESS)*;
// SUM -> PRODUCT (('-' | '+') PRODUCT)*;
// INEQUALITY -> SUM (('<' | '>' | '<=' | '>=') SUM)*;
// EQUALITY -> INEQUALITY (('==' | '!=') INEQUALITY)*;
// ASSIGNMENT -> EQUALITY ('=' EQUALITY)*;
export namespace DecideArrayOrCall {

    //we now finally get to use extensions
    //@ts-ignore
    const arrayAccessExtension = createExtension((parser, from, sync) => {

        parser.match({
            expected: TokenType.LSquareBrace,
            sync: sync.union(new Set([TokenType.Integer, TokenType.RSquareBrace])),
            title: "Expected a starting square bracket '[' for array accesor"
        })

        const number = parser.digest({
            expected: TokenType.Integer,
            sync: sync.union(new Set([TokenType.RSquareBrace])),
            title: "Expected an integer for array addressing"
        })

        parser.match({
            expected: TokenType.RSquareBrace,
            sync,
            title: "Expected closing square bracket ']' for array accessor"
        })

        const output = {
            is: "array-access",
            from,
            at: number
        }

        return parser.useExtension(
            () => output,
            extension,
            sync
        )

    }, TokenType.LSquareBrace)

    //@ts-ignore
    const callExtension = createExtension((parser, from, sync) => {

        parser.match({
            expected: TokenType.LBrace,
            sync: sync.union(new Set([TokenType.RBrace, TokenType.Comma])).union(Node.first),
            title: "Expected a starting bracket '(' for call signature"
        })

        const nodes: Node[] = []

        if (parser.peek().tokenType == TokenType.RBrace) {
            parser.advance()
            return {
                callee: from,
                arguments: nodes
            } //early exit
        }

        while (true) {

            nodes.push(
                //@ts-ignore
                Node.parse(parser, sync.union(new Set([TokenType.LBrace, TokenType.Comma, TokenType.RBrace])))
            )

            //we now follow the algorithm of a loop.
            const token = parser.peek()

            //! REMEMBER THIS CASE.
            //! SINCE EXTERNAL SYNC TOKEN CAN CONTAIN THE TOKENS WE ARE SUPPOSE TO HANDLE
            //? sync.has(token) cannot guarantee a token exist outside our production's internal sync set.
            //? which means, we must guarantee that ourselves
            if (sync.has(token.tokenType) && token.tokenType != TokenType.Comma && token.tokenType != TokenType.RBrace && !Node.first.has(token.tokenType)) {

                parser.syncToken(false, sync, "Expected a ')' to end call signature", token)
                break

            }

            if (token.tokenType == TokenType.RBrace) {

                parser.advance()
                break

            }

            if (Node.first.has(token.tokenType)) {

                parser.report("Make sure to have arguments separated by comma", token)
                continue;

            }

            if (token.tokenType == TokenType.Comma) {

                parser.advance()
                continue;

            }

            parser.match({
                expected: TokenType.Comma,
                sync: sync.union(new Set([TokenType.RBrace])).union(Node.first),
                title: "Expected a comma separator, got something else"
            })

        }

        let output = {
            callee: from,
            arguments: nodes
        }

        return parser.useExtension(() => output, extension, sync)

    }, TokenType.LBrace)

    //@ts-ignore
    const extension = extensionGroup(arrayAccessExtension, callExtension)

    export const first = Atom.first //obviously
    export function parse(parser: Parser, sync: Set<TokenType>) {

        return parser.useExtension(
            () => Atom.parse(
                parser,
                sync.union(new Set([TokenType.LBrace, TokenType.LSquareBrace]))
            ),
            extension, sync
        )

    }
}

export namespace Binding {

    const operators = new Set([TokenType.DoubleColon])
    export const first = Atom.first //obviously
    export function parse(parser: Parser, sync: Set<TokenType>): Node {

        let left = DecideArrayOrCall.parse(parser, sync.union(operators))
        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()
            left = {
                //@ts-ignore FOR NOW
                operator: TokenType[token.tokenType],
                left: left,
                right: DecideArrayOrCall.parse(parser, sync)
            }

            token = parser.peek()

        }

        //@ts-ignore
        return left

    }

}

export namespace Magnetic {

    const operators = new Set([TokenType.ArrowRight])
    export const first = Atom.first //obviously
    export function parse(parser: Parser, sync: Set<TokenType>) {

        let left = Binding.parse(parser, sync.union(operators))
        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()
            left = {
                //@ts-ignore FOR NOW
                operator: TokenType[token.tokenType],
                left: left,
                right: Binding.parse(parser, sync)
            }

            token = parser.peek()
        }

        return left

    }

}

export namespace Access {

    const operators = new Set([TokenType.Dot])
    export const first = Atom.first //obviously
    export function parse(parser: Parser, sync: Set<TokenType>) {
        let left = Magnetic.parse(parser, sync.union(operators))

        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()
            left = {
                //@ts-ignore FOR NOW
                operator: TokenType[token.tokenType],
                left: left,
                right: Magnetic.parse(parser, sync)
            }

            token = parser.peek()
        }

        return left

    }

}

export namespace Product {

    const operators = new Set([TokenType.Multiply, TokenType.Divide])
    export const first = Atom.first //obviously
    export function parse(parser: Parser, sync: Set<TokenType>) {
        let left = Access.parse(parser, sync.union(operators))

        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()
            left = {
                //@ts-ignore FOR NOW
                operator: TokenType[token.tokenType],
                left: left,
                right: Access.parse(parser, sync)
            }

            token = parser.peek()
        }

        return left

    }

}

export namespace Sum {

    const operators = new Set([TokenType.Add, TokenType.Minus])
    export const first = Atom.first //obviously
    export function parse(parser: Parser, sync: Set<TokenType>) {
        let left = Product.parse(parser, sync.union(operators))

        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()
            left = {
                //@ts-ignore FOR NOW
                operator: TokenType[token.tokenType],
                left: left,
                right: Product.parse(parser, sync)
            }

            token = parser.peek()
        }

        return left

    }

}

export namespace Inequality {

    const operators = new Set([TokenType.LessThan, TokenType.GreaterThan, TokenType.LessThanEqual, TokenType.GreaterThanEqual])
    export const first = Atom.first //obviously
    export function parse(parser: Parser, sync: Set<TokenType>) {

        let left = Sum.parse(parser, sync.union(operators))

        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()
            left = {
                //@ts-ignore FOR NOW
                operator: TokenType[token.tokenType],
                left: left,
                right: Sum.parse(parser, sync)
            }

            token = parser.peek()
        }

        return left

    }

}

export namespace Equality {

    const operators = new Set([TokenType.Compare, TokenType.NotEqual])
    export const first = Atom.first //obviously
    export function parse(parser: Parser, sync: Set<TokenType>) {

        let left = Inequality.parse(parser, sync.union(operators))

        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()
            left = {
                //@ts-ignore FOR NOW
                operator: TokenType[token.tokenType],
                left: left,
                right: Inequality.parse(parser, sync)
            }

            token = parser.peek()
        }

        return left

    }

}

export namespace Assignment {

    export const first = Atom.first //obviously
    export function parse(parser: Parser, sync: Set<TokenType>) {

        let left = Equality.parse(parser, sync.union(new Set([TokenType.Assignment])))

        while (parser.peek().tokenType == TokenType.Assignment) {
            parser.advance()
            left = {
                //@ts-ignore FOR NOW
                operator: "=",
                left: left,
                right: Equality.parse(parser, sync)
            }


        }

        return left

    }

}

export namespace Return {

    export const first: Set<TokenType> = union(TokenType.K_Return)
    export function parse(parser: Parser, sync: Set<TokenType>) {

        const output = parser.useExtension(
            () => {
                parser.match({
                    expected: TokenType.K_Return,
                    sync: union(sync, Assignment.first),
                    title: "Expected a return keyword"
                })

                return {
                    is: "return-statement"
                }
            },
            createExtension((parser, _, sync) => {

                return {
                    is: "return-statement",
                    expr: Assignment.parse(parser, sync)
                }

            }, ...Assignment.first.keys()),
            sync
        )

        return output

    }

}

export namespace Break {

    export const first: Set<TokenType> = union(TokenType.K_Break)
    export function parse(parser: Parser, sync: Set<TokenType>) {

        const output = parser.useExtension(
            () => {
                parser.match({
                    expected: TokenType.K_Break,
                    sync: union(TokenType.Identifier),
                    title: "Expected a break keyword"
                })

                return {
                    is: "break-statement"
                }
            },
            createExtension((parser, _, sync) => {

                return {
                    is: "break-statement",
                    name: parser.digest({
                        expected: TokenType.Identifier,
                        sync,
                        title: "Expected an identifier for break."
                    })
                }

            }, TokenType.Identifier),
            sync
        )

        return output

    }

}

export namespace Substitution {

    export const first = new Set([TokenType.K_Sub])
    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Sub,
            sync: union(sync, Node.first, TokenType.K_With),
            title: "Expected a sub keyword"
        })

        const node1 = Node.parse(parser, union(sync, Node.first, TokenType.K_With))

        parser.match({
            expected: TokenType.K_With,
            sync: union(sync, Node.first),
            title: "Expected a 'with' keyword"
        })

        const node2 = Node.parse(parser, sync)

        return {
            is: "substitution",
            original: node1,
            subs: node2
        }

    }

}

export namespace Let {

    export const first = union(TokenType.K_Let)

    function parseBody(parser: Parser, sync: Set<TokenType>) {

        const identifier = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, TokenType.Colon, Type.first, TokenType.Assignment, Node.first),
            title: "Expected a name for the variable"
        })

        parser.match({
            expected: TokenType.Colon,
            sync: union(sync, Type.first, TokenType.Assignment, Node.first),
            title: "Expected a colon here"
        })

        const type = Type.parse(
            parser,
            union(sync, TokenType.Assignment, Node.first)
        )

        parser.match({
            expected: TokenType.Assignment,
            sync: union(sync, Node.first),
            title: "Expected equal sign here"
        })

        const node = Node.parse(parser, sync)

        return {
            identifier,
            type,
            node
        }

    }

    const modifierExtension = createExtension((parser, _, sync) => {

        parser.advance()

        //@ts-ignore
        const modifiers = []

        parser.useLoop({
            callback: (item) => modifiers.push(item),
            production: (parser, sync) => Modifier.parse(parser, sync),
            deliminator: TokenType.RBrace,
            separator: TokenType.Comma,
            first: Modifier.first,
            sync,
            titles: {
                closing: "Expected a closing ')' bracket",
                separator: "Expected a comma before a modifier",
                separatorMissing: "Expected a comma separator, got something else"
            }
        })

        // modifiers.push(
        //     Modifier.parse(parser, union(sync, TokenType.Comma, TokenType.RBrace, Modifier.first))
        // )

        // while (true) {

        //     //what token we encounter determines what happens
        //     const tokenRoot = parser.peek()
        //     const token = tokenRoot.tokenType

        //     if (sync.has(token) && token != TokenType.RBrace && token != TokenType.Comma && !Modifier.first.has(token)) {

        //         //we have completed the sync and we have also crossed the delim
        //         parser.syncToken(false, sync, "Expected a closing ')' bracket", tokenRoot)
        //         break

        //     }

        //     if (token == TokenType.RBrace) {
        //         //so this is our deliminator
        //         parser.advance()
        //         break
        //     }

        //     if (Modifier.first.has(token)) {

        //         //we encounted a new production without using the separator

        //         //why? because if any previous error occurs, most likely due to separator, we do not report.
        //         parser.report("Provide a separator, '.' (DOT) or ',' (COMMA) before a path", tokenRoot)

        //         modifiers.push(
        //             Modifier.parse(parser, union(sync, TokenType.Comma, TokenType.RBrace, Modifier.first))
        //         )

        //         continue;
        //     }

        //     if (token == TokenType.Comma) {

        //         //if it's our separator
        //         parser.advance()
        //         modifiers.push(
        //             Modifier.parse(parser, union(sync, TokenType.Comma, TokenType.RBrace, Modifier.first))
        //         )

        //         continue;

        //     }

        //     //otherwise we try to sync and continue. Eventually reaching EOF ofc.
        //     parser.match({
        //         expected: TokenType.Comma,
        //         sync: union(sync, TokenType.RBrace, Modifier.first),
        //         title: "Expected a comma separator, got something else"
        //     })

        // }

        //@ts-ignore
        return modifiers

    }, TokenType.LBrace)

    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Let,
            sync: union(sync, TokenType.Identifier, TokenType.LBrace),
            title: "Expected the let keyword"
        })

        let modifiers = parser.useExtension(() => [], modifierExtension, sync)
        const body = parseBody(parser, sync)

        return {
            is: "let-decl",
            modifiers,
            body
        }

    }

}

export namespace Transformer {
    export const first = union(TokenType.K_Transform)
    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Transform,
            sync: union(sync, Type.first, TokenType.Colon, TokenType.Identifier, TokenType.K_To, Assignment.first),
            title: "Expected a transform keyword"
        })

        const from = Assignment.parse(
            parser,
            union(sync, Type.first, TokenType.Colon, TokenType.Identifier, TokenType.K_To)
        )

        parser.match({
            expected: TokenType.K_To,
            sync: union(sync, Type.first, TokenType.Colon, TokenType.Identifier),
            title: "Expected keyword 'to'"
        })

        const name = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, Type.first, TokenType.Colon),
            title: "Expected a name for this transformation"
        })

        parser.match({
            expected: TokenType.Colon,
            sync: union(sync, Type.first),
            title: "Expected a colon (:) here"
        })

        const type = Type.parse(
            parser, sync
        )

        return {
            is: "transform",
            from,
            name,
            type
        }

    }
}

export namespace Statement {

    export const first = union(Return.first, Break.first, Substitution.first, Transformer.first, Let.first)

    const returnBranch = createBranch((parser, sync) => Return.parse(parser, sync), ...Return.first)
    const breakBranch = createBranch((parser, sync) => Break.parse(parser, sync), ...Break.first)
    const subBranch = createBranch((parser, sync) => Substitution.parse(parser, sync), ...Substitution.first)
    const transformerBranch = createBranch((parser, sync) => Transformer.parse(parser, sync), ...Transformer.first)
    const letBranch = createBranch((parser, sync) => Let.parse(parser, sync), ...Let.first)

    const branch = branchGroup(returnBranch, breakBranch, subBranch, transformerBranch, letBranch)

    export function parse(parser: Parser, sync: Set<TokenType>) {

        return parser.useBranch(branch, "Expected a valid start to a statement", sync)

    }

}

export namespace NewAllocation {

    export const first: Set<TokenType> = new Set([TokenType.K_New])
    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_New,
            sync: union(sync, Assignment.first, TokenType.GreaterThan, TokenType.Identifier, TokenType.LessThan),
            title: "Expected the keyword 'new'"
        })

        parser.match({
            expected: TokenType.LessThan,
            sync: union(sync, Assignment.first, TokenType.GreaterThan, TokenType.Identifier),
            title: "Expected a starting angle bracket '<'"
        })

        const name = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, Assignment.first, TokenType.GreaterThan),
            title: "Expected the allocator itself"
        })

        parser.match({
            expected: TokenType.GreaterThan,
            sync: union(sync, Assignment.first),
            title: "Expected a closing angle bracket '>'"
        })

        const assignment = Assignment.parse(parser, sync)

        return {
            is: "new-allocation",
            name,
            expr: assignment
        }

    }

}


export namespace FreeAllocation {

    export const first: Set<TokenType> = union(TokenType.K_Free)
    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Free,
            sync: union(sync, Assignment.first, TokenType.GreaterThan, TokenType.Identifier, TokenType.LessThan),
            title: "Expected the keyword 'new'"
        })

        parser.match({
            expected: TokenType.LessThan,
            sync: union(sync, Assignment.first, TokenType.GreaterThan, TokenType.Identifier),
            title: "Expected a starting angle bracket '<'"
        })

        const name = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, Assignment.first, TokenType.GreaterThan),
            title: "Expected the allocator itself"
        })

        parser.match({
            expected: TokenType.GreaterThan,
            sync: union(sync, Assignment.first),
            title: "Expected a closing angle bracket '>'"
        })

        const assignment = Assignment.parse(parser, sync)

        return {
            is: "free-allocation",
            name,
            expr: assignment
        }

    }

}

export namespace Allocator {

    export const first = union(NewAllocation.first, FreeAllocation.first)
    const newAllocBranch = createBranch((parser, sync) => NewAllocation.parse(parser, sync), TokenType.K_New)
    const freeAllocBranch = createBranch((parser, sync) => FreeAllocation.parse(parser, sync), TokenType.K_Free)
    const branch = branchGroup(newAllocBranch, freeAllocBranch)

    export function parse(parser: Parser, sync: Set<TokenType>) {

        return parser.useBranch(branch, "Expected the keyword 'new' or 'free' for allocation", sync)

    }
}

export namespace Node {

    //* NODE -> ASSIGNMENT | STATEMENT | ALLOCATORS
    //* BASICALLY IS A BRANCH HERE
    export const first: Set<TokenType> = union(Assignment.first, Allocator.first, Statement.first) //with more coming

    const assignmentBranch = createBranch((parser, sync) => Assignment.parse(parser, sync), ...Assignment.first.keys())
    const allocatorBranch = createBranch((parser, sync) => Allocator.parse(parser, sync), ...Allocator.first.keys())
    const statementBranch = createBranch((parser, sync) => Statement.parse(parser, sync), ...Statement.first.keys())

    const branch = branchGroup(allocatorBranch, assignmentBranch, statementBranch)

    export function parse(parser: Parser, sync: Set<TokenType>) {

        //for now.
        return parser.useBranch(branch, "Expected an expression or allocator statement", sync)

    }


}