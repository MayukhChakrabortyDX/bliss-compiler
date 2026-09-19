import { TokenType } from "../../lexer/tokens"
import { First } from "../first";
import type { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";
import { ParseNode, ParseNodeEnum } from "../utility/parse_node";
import { union } from "../utility/union";

export class IfBranch extends ParseNode<ParseNodeEnum.IfBranch> {
    constructor(public condition: ParseNode<any>, public body: ParseNode<any>) {
        super(ParseNodeEnum.IfBranch)
    }
}

const ifBranch = createBranch((parser, sync) => {

    const finish = parser.start()

    parser.match({
        expected: TokenType.K_If,
        sync: union(sync, First.Structure.Body, TokenType.RBrace, First.Node, TokenType.LBrace),
        title: "Expected the keyword if"
    })

    parser.match({
        expected: TokenType.LBrace,
        sync: union(sync, First.Structure.Body, TokenType.RBrace, First.Node),
        title: "Expected a starting '(' bracket here instead"
    })

    const node = parser.parseNode(union(sync, First.Structure.Body, TokenType.RBrace))

    parser.match({
        expected: TokenType.RBrace,
        sync: union(sync, First.Structure.Body),
        title: "Expected a closing ')' bracket here"
    })

    const body = parser.parseBody(sync, "if statement")

    return finish(
        new IfBranch(node, body)
    )

}, TokenType.K_If)


export class ElifBranch extends ParseNode<ParseNodeEnum.ElifBranch> {
    constructor(public condition: ParseNode<any>, public body: ParseNode<any>) {
        super(ParseNodeEnum.ElifBranch)
    }
}

const elifBranch = createBranch((parser, sync) => {

    const finish = parser.start()
    
    parser.match({
        expected: TokenType.K_Elif,
        sync: union(sync, First.Structure.Body, TokenType.RBrace, First.Node, TokenType.LBrace),
        title: "Expected the keyword elif here"
    })

    parser.match({
        expected: TokenType.LBrace,
        sync: union(sync, First.Structure.Body, TokenType.RBrace, First.Node),
        title: "Expected a starting '(' bracket here instead"
    })

    const node = parser.parseNode(union(sync, First.Structure.Body, TokenType.RBrace))

    parser.match({
        expected: TokenType.RBrace,
        sync: union(sync, First.Structure.Body),
        title: "Expected a closing ')' bracket here"
    })

    const body = parser.parseBody(sync, "elif statement")

    return finish(
        new ElifBranch(node, body)
    )

}, TokenType.K_Elif)

export class ElseBranch extends ParseNode<ParseNodeEnum.ElseBranch> {
    constructor(public body: ParseNode<any>) {
        super(ParseNodeEnum.ElseBranch)
    }
}

const elseBranch = createBranch((parser, sync) => {

    const finish = parser.start()

    parser.match({
        expected: TokenType.K_Else,
        sync: union(sync, First.Structure.Body, TokenType.RBrace, First.Node, TokenType.LBrace),
        title: "Expected the keyword else here"
    })

    const body = parser.parseBody(sync, "else statement")

    return finish(
        new ElseBranch(body)
    )

}, TokenType.K_Else)

const branch = branchGroup(ifBranch, elifBranch, elseBranch)

export function parseCondition(parser: Parser, sync: Set<TokenType>): IfBranch | ElifBranch | ElseBranch {

    return parser.useBranch(branch, "Expected a valid condition start", sync)

}