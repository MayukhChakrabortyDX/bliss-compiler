//the strongest that I am going to attempt now.
import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";
import { createExtension, extensionGroup, useExtension } from "../utility/extension";
import { digest, nterm, token } from "../utility/linear";
import { BinaryOperatorEnum, ParseNode, ParseNodeEnum, UnaryOperatorEnum } from "../utility/parse_node";
import { union } from "../utility/union";

export class BinaryOperator<T extends BinaryOperatorEnum> extends ParseNode<ParseNodeEnum.BinaryOperator> {
    constructor(public operator: T, public left: any, public right: any) {
        super(ParseNodeEnum.BinaryOperator)
    }
}

export class UnaryOperator<T extends UnaryOperatorEnum> extends ParseNode<ParseNodeEnum.UnaryOperator> {
    constructor(public operator: T, public over: any) {
        super(ParseNodeEnum.UnaryOperator)
    }
}

export enum AtomEnum {
    Identifier, Integer, Real, String, Pointer, Handle, Reference, AddressOf, SizeOf
}

export class NodeAtom<T extends AtomEnum> extends ParseNode<ParseNodeEnum.Atom> {
    constructor(
        public atomKind: T,
        public body:
            T extends AtomEnum.Identifier ? string :
            T extends AtomEnum.Integer ? number :
            T extends AtomEnum.Real ? number :
            T extends AtomEnum.String ? string :
            T extends AtomEnum.Pointer ? {
                accesor: ParseNode<ParseNodeEnum.Node>,
                size?: ParseNode<ParseNodeEnum.Node>
            } :
            T extends AtomEnum.Handle ? {
                accesor: ParseNode<ParseNodeEnum.Node>,
                size?: ParseNode<ParseNodeEnum.Node>
            } : ParseNode<ParseNodeEnum.Atom> //because the remaining one already expects this
    ) {
        super(ParseNodeEnum.Atom)
    }
}

namespace AtomDetails {

    const identifierBranch = createBranch((parser, sync) => {

        const identifier = parser.digest({
            expected: TokenType.Identifier,
            sync,
            title: "Expected an identifier"
        })

        return new NodeAtom(
            AtomEnum.Identifier,
            identifier
        )

    }, TokenType.Identifier)

    const integerBranch = createBranch((parser, sync) => {

        const number = parser.digest({
            expected: TokenType.Integer,
            sync,
            title: "Expected an integer"
        })

        return new NodeAtom(
            AtomEnum.Integer,
            parseInt(number)
        )

    }, TokenType.Integer)

    const realNumBranch = createBranch((parser, sync) => {

        const number = parser.digest({
            expected: TokenType.RealNumber,
            sync,
            title: "Expected a real number"
        })

        return new NodeAtom(
            AtomEnum.Real,
            parseFloat(number)
        )

    }, TokenType.RealNumber)

    const stringBranch = createBranch((parser, sync) => {

        const str = parser.digest({
            expected: TokenType.String,
            sync,
            title: "Expected a string"
        })

        return new NodeAtom(
            AtomEnum.String,
            str
        )

    }, TokenType.String)

    const bracketNodeBranch = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.LBrace,
            sync: sync.union(First.Node).union(new Set([TokenType.RBrace])),
            title: "Expected a starting bracket '('"
        })

        const node = parser.parseNode(sync.union(new Set([TokenType.RBrace])))

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
            sync: sync.union(First.Atom),
            title: "Expected a backtick"
        })

        const atom = parser.parseAtom(sync)

        return new NodeAtom(
            AtomEnum.Reference,
            atom
        )

    }, TokenType.Backtick)

    const addressAtomBranch = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.K_Adrs,
            sync: sync.union(First.Atom),
            title: "Expected token 'adrs'"
        })

        const atom = parser.parseAtom(sync)

        return new NodeAtom(
            AtomEnum.AddressOf,
            atom
        )

    }, TokenType.K_Adrs)

    const sizeAtomBranch = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.K_Sizeof,
            sync: sync.union(First.Atom),
            title: "Expected token 'sizeof'"
        })

        const atom = parser.parseAtom(sync)

        return new NodeAtom(
            AtomEnum.SizeOf,
            atom
        )

    }, TokenType.K_Sizeof)

    const pointerAccessBranch = createBranch((parser, sync) => {

        parser.match({
            expected: TokenType.LSquareBrace,
            sync: sync.union(new Set([TokenType.StraightBar, TokenType.RSquareBrace])),
            title: "Expected a starting '[' bracket"
        })

        const center = useExtension(
            parser,
            () => new NodeAtom(
                AtomEnum.Pointer,
                {
                    accesor: parser.parseNode(union(sync, TokenType.RSquareBrace))
                }
            ),
            createExtension((parser, from, sync) => {

                parser.advance() //straight bar is known, no need to repeat.
                const node = parser.parseNode(union(sync, TokenType.RSquareBrace))

                from.body.size = node

                return from

            }, TokenType.StraightBar),
            sync
        )

        parser.match({
            expected: TokenType.RSquareBrace,
            sync,
            title: "Expected an ending ']' bracket"
        })

        return center

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
            () => new NodeAtom(
                AtomEnum.Handle,
                {
                    accesor: parser.parseNode(union(sync, TokenType.RSquareBrace))
                }
            ),
            createExtension((parser, from, sync) => {

                parser.advance() //straight bar is known, no need to repeat.
                const node = parser.parseNode(sync.union(new Set([TokenType.RBrace])))

                from.body.size = node

                return from

            }, TokenType.StraightBar),
            sync
        )

        parser.match({
            expected: TokenType.RSquareBrace,
            sync,
            title: "Expected an ending ']' bracket"
        })

        return center

    }, TokenType.HashSymbol)

    export const branch = branchGroup(handleAccessBranch, pointerAccessBranch, sizeAtomBranch, addressAtomBranch, referenceAtomBranch, identifierBranch, realNumBranch, integerBranch, stringBranch, bracketNodeBranch)

}

//* VERIFIED AND CACHED
export function parseAtom(parser: Parser, sync: Set<TokenType>): NodeAtom<AtomEnum> {

    return parser.useBranch(
        AtomDetails.branch,
        "Invalid expression start token",
        sync
    )
}

export class Array extends ParseNode<ParseNodeEnum.Array> {
    constructor() {
        super(ParseNodeEnum.Array)
    }
}

namespace DecideArrayOrCall {

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
            //! TEMPORARY FIX
            span: {
                start: 0,
                end: 0
            },
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
            sync: sync.union(new Set([TokenType.RBrace, TokenType.Comma])).union(First.Node),
            title: "Expected a starting bracket '(' for call signature"
        })

        const nodes: Node[] = []

        if (parser.peek().tokenType == TokenType.RBrace) {
            parser.advance()
            return {
                callee: from,
                arguments: nodes,
                span: {
                    start: 0,
                    end: 0
                }
            } //early exit
        }

        while (true) {

            nodes.push(
                //@ts-ignore
                parser.parseNode(sync.union(new Set([TokenType.LBrace, TokenType.Comma, TokenType.RBrace])))
            )

            //we now follow the algorithm of a loop.
            const token = parser.peek()

            //! REMEMBER THIS CASE.
            //! SINCE EXTERNAL SYNC TOKEN CAN CONTAIN THE TOKENS WE ARE SUPPOSE TO HANDLE
            //? sync.has(token) cannot guarantee a token exist outside our production's internal sync set.
            //? which means, we must guarantee that ourselves
            if (sync.has(token.tokenType) && token.tokenType != TokenType.Comma && token.tokenType != TokenType.RBrace && !First.Node.has(token.tokenType)) {

                parser.syncToken(false, sync, "Expected a ')' to end call signature", token)
                break

            }

            if (token.tokenType == TokenType.RBrace) {

                parser.advance()
                break

            }

            if (First.Node.has(token.tokenType)) {

                parser.report("Make sure to have arguments separated by comma", token)
                continue;

            }

            if (token.tokenType == TokenType.Comma) {

                parser.advance()
                continue;

            }

            parser.match({
                expected: TokenType.Comma,
                sync: sync.union(new Set([TokenType.RBrace])).union(First.Node),
                title: "Expected a comma separator, got something else"
            })

        }

        let output = {
            span: {
                start: 0,
                end: 0
            },
            callee: from,
            arguments: nodes
        }

        return parser.useExtension(() => output, extension, sync)

    }, TokenType.LBrace)

    //@ts-ignore
    const extension = extensionGroup(arrayAccessExtension, callExtension)

    export const first = First.Atom //obviously
    export function parse(parser: Parser, sync: Set<TokenType>): ParseNode<ParseNodeEnum.Atom | ParseNodeEnum.UnaryOperator> {

        return parser.useExtension(
            () => parser.parseAtom(
                sync.union(new Set([TokenType.LBrace, TokenType.LSquareBrace]))
            ),
            extension, sync
        )

    }
}

//propagate the return type
type PRT = ParseNode<ParseNodeEnum.Atom | ParseNodeEnum.BinaryOperator | ParseNodeEnum.UnaryOperator>;

namespace Binding {

    const operators = new Set([TokenType.DoubleColon])
    export const first = First.Atom //obviously
    export function parse(parser: Parser, sync: Set<TokenType>): PRT {

        let left = DecideArrayOrCall.parse(parser, sync.union(operators))
        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()

            //@ts-ignore overwrite
            left = new BinaryOperator(
                BinaryOperatorEnum.Binding,
                left, DecideArrayOrCall.parse(parser, sync)
            )

            token = parser.peek()

        }

        return left

    }

}

namespace Magnetic {

    const operators = new Set([TokenType.ArrowRight])
    export const first = First.Atom //obviously
    export function parse(parser: Parser, sync: Set<TokenType>): PRT {

        const finish = parser.start()
        let left = Binding.parse(parser, sync.union(operators))
        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()

            left = new BinaryOperator(
                BinaryOperatorEnum.Magnetic,
                left, Binding.parse(parser, sync)
            )

            token = parser.peek()
        }

        return finish(left)

    }

}

namespace Access {

    const operators = new Set([TokenType.Dot])
    export const first = First.Atom //obviously
    export function parse(parser: Parser, sync: Set<TokenType>): PRT {

        const finish = parser.start()
        let left = Magnetic.parse(parser, sync.union(operators))

        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()
            left = new BinaryOperator(
                BinaryOperatorEnum.Access,
                left, Magnetic.parse(parser, sync)
            )

            token = parser.peek()
        }

        return finish(left)

    }

}

namespace Product {

    const operators = new Set([TokenType.Multiply, TokenType.Divide])
    export const first = First.Atom //obviously
    export function parse(parser: Parser, sync: Set<TokenType>): PRT {

        const finish = parser.start()
        let left = Access.parse(parser, sync.union(operators))

        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()
            left = new BinaryOperator(
                token.tokenType == TokenType.Multiply ? BinaryOperatorEnum.Product : BinaryOperatorEnum.Division,
                left, Access.parse(parser, sync)
            )

            token = parser.peek()
        }

        return finish(left)

    }

}

namespace Sum {

    const operators = new Set([TokenType.Add, TokenType.Minus])
    export const first = First.Atom //obviously
    export function parse(parser: Parser, sync: Set<TokenType>): PRT {

        const finish = parser.start()
        let left = Product.parse(parser, sync.union(operators))

        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()
            left = new BinaryOperator(
                token.tokenType == TokenType.Add ? BinaryOperatorEnum.Sum : BinaryOperatorEnum.Subtraction,
                left, Product.parse(parser, sync)
            )

            token = parser.peek()
        }

        return finish(left)

    }

}

namespace Inequality {

    const operators = new Set([TokenType.LessThan, TokenType.GreaterThan, TokenType.LessThanEqual, TokenType.GreaterThanEqual])
    export const first = First.Atom //obviously
    export function parse(parser: Parser, sync: Set<TokenType>): PRT {

        const finish = parser.start()
        let left = Sum.parse(parser, sync.union(operators))

        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()

            left = new BinaryOperator(
                token.tokenType == TokenType.LessThan ? BinaryOperatorEnum.LessThan :
                    token.tokenType == TokenType.GreaterThan ? BinaryOperatorEnum.GreaterThan :
                        token.tokenType == TokenType.LessThanEqual ? BinaryOperatorEnum.LessThanEqual :
                            BinaryOperatorEnum.GreaterThanEqual,
                left, Sum.parse(parser, sync)
            )

            token = parser.peek()
        }

        return finish(left)

    }

}

namespace Equality {

    const operators = new Set([TokenType.Compare, TokenType.NotEqual])
    export const first = First.Atom //obviously
    export function parse(parser: Parser, sync: Set<TokenType>): PRT {

        const finish = parser.start()

        let left = Inequality.parse(parser, sync.union(operators))

        let token = parser.peek()

        while (operators.has(token.tokenType)) {

            parser.advance()
            left = new BinaryOperator(
                token.tokenType == TokenType.Compare ? BinaryOperatorEnum.Equality : BinaryOperatorEnum.Inequality,
                left, Inequality.parse(parser, sync)
            )

            token = parser.peek()
        }

        return finish(left)

    }

}

namespace Assignment {

    export const first = First.Atom //obviously
    export function parse(parser: Parser, sync: Set<TokenType>): PRT {

        const finish = parser.start()

        let left = Equality.parse(parser, sync.union(new Set([TokenType.Assignment])))

        while (parser.peek().tokenType == TokenType.Assignment) {
            parser.advance()
            left = new BinaryOperator(
                BinaryOperatorEnum.Assignment,
                left, Equality.parse(parser, sync)
            )
        }

        return finish(left)

    }

}

// STATEMENTS STARTS HERE

namespace Return {

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

namespace Break {

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

namespace Substitution {

    export const first = new Set([TokenType.K_Sub])
    export function parse(parser: Parser, sync: Set<TokenType>) {

        parser.match({
            expected: TokenType.K_Sub,
            sync: union(sync, First.Node, TokenType.K_With),
            title: "Expected a sub keyword"
        })

        const node1 = parser.parseNode(union(sync, First.Node, TokenType.K_With))

        parser.match({
            expected: TokenType.K_With,
            sync: union(sync, First.Node),
            title: "Expected a 'with' keyword"
        })

        const node2 = parser.parseNode(sync)

        return {
            is: "substitution",
            original: node1,
            subs: node2
        }

    }

}

namespace Let {

    export const first = union(TokenType.K_Let)

    function parseBody(parser: Parser, sync: Set<TokenType>) {

        const identifier = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, TokenType.Colon, First.Type, TokenType.Assignment, First.Node),
            title: "Expected a name for the variable"
        })

        parser.match({
            expected: TokenType.Colon,
            sync: union(sync, First.Type, TokenType.Assignment, First.Node),
            title: "Expected a colon here"
        })

        const type = parser.parseType(
            union(sync, TokenType.Assignment, First.Node)
        )

        parser.match({
            expected: TokenType.Assignment,
            sync: union(sync, First.Node),
            title: "Expected equal sign here"
        })

        const node = parser.parseNode(sync)

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
            production: (parser, sync) => parser.parseModifier(sync),
            deliminator: TokenType.RBrace,
            separator: TokenType.Comma,
            first: First.Modifier,
            sync,
            titles: {
                closing: "Expected a closing ')' bracket",
                separator: "Expected a comma before a modifier",
                separatorMissing: "Expected a comma separator, got something else"
            }
        })

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

namespace Transformer {
    export const first = union(TokenType.K_Transform)
    export function parse(parser: Parser, sync: Set<TokenType>) {



        parser.match({
            expected: TokenType.K_Transform,
            sync: union(sync, First.Type, TokenType.Colon, TokenType.Identifier, TokenType.K_To, Assignment.first),
            title: "Expected a transform keyword"
        })

        const from = Assignment.parse(
            parser,
            union(sync, First.Type, TokenType.Colon, TokenType.Identifier, TokenType.K_To)
        )

        parser.match({
            expected: TokenType.K_To,
            sync: union(sync, First.Type, TokenType.Colon, TokenType.Identifier),
            title: "Expected keyword 'to'"
        })

        const name = parser.digest({
            expected: TokenType.Identifier,
            sync: union(sync, First.Type, TokenType.Colon),
            title: "Expected a name for this transformation"
        })

        parser.match({
            expected: TokenType.Colon,
            sync: union(sync, First.Type),
            title: "Expected a colon (:) here"
        })

        const type = parser.parseType(
            sync
        )

        return {
            is: "transform",
            from,
            name,
            type
        }

    }
}

namespace Statement {

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

export enum AllocationKind {
    New, Free
}

export class AllocationStatement<T extends AllocationKind> extends ParseNode<ParseNodeEnum.Allocation> {
    constructor(public allocationKind: T, public name: string, public body: PRT) {
        super(ParseNodeEnum.Allocation)
    }
}

namespace NewAllocation {

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

        return new AllocationStatement(AllocationKind.New, name, assignment)

    }

}

namespace FreeAllocation {
    export const first: Set<TokenType> = union(TokenType.K_Free)
    export function parse(parser: Parser, sync: Set<TokenType>) {

        const output = parser.terminal<{ "assignment": PRT, "name": string }>(
            sync,
            "NsFa",
            token(TokenType.K_Free, "Expected the keyword 'free'"),
            token(TokenType.LessThan, "Expected a starting angle bracket '<'"),
            digest(TokenType.Identifier, "Expected the allocation identifier", "name"),
            token(TokenType.GreaterThan, "Expected a closing angle bracket '>'"),
            nterm(Assignment.parse, Assignment.first, "assignment")
        )

        return new AllocationStatement(AllocationKind.Free, output.name, output.assignment)

    }
}

namespace Allocator {

    export const first = union(NewAllocation.first, FreeAllocation.first)
    const newAllocBranch = createBranch((parser, sync) => NewAllocation.parse(parser, sync), TokenType.K_New)
    const freeAllocBranch = createBranch((parser, sync) => FreeAllocation.parse(parser, sync), TokenType.K_Free)
    const branch = branchGroup(newAllocBranch, freeAllocBranch)

    export function parse(parser: Parser, sync: Set<TokenType>) {

        return parser.useBranch(branch, "Expected the keyword 'new' or 'free' for allocation", sync)

    }
}

export function parseNode(parser: Parser, sync: Set<TokenType>) {

    const assignmentBranch = createBranch((parser, sync) => Assignment.parse(parser, sync), ...Assignment.first.keys())
    const allocatorBranch = createBranch((parser, sync) => Allocator.parse(parser, sync), ...Allocator.first.keys())
    const statementBranch = createBranch((parser, sync) => Statement.parse(parser, sync), ...Statement.first.keys())

    const branch = branchGroup(allocatorBranch, assignmentBranch, statementBranch)
    //for now.
    return parser.useBranch(branch, "Expected an expression or allocator statement", sync)

}