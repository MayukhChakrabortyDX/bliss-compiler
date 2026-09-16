import { TokenType } from "../../lexer/tokens"
import { First } from "../first";
import type { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";
import { union } from "../utility/union";

const ifBranch = createBranch((parser, sync) => {

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

    return {
        is: "if-statement",
        node,
        body
    }

}, TokenType.K_If)

const elifBranch = createBranch((parser, sync) => {
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

    return {
        is: "elif-statement",
        node,
        body
    }
}, TokenType.K_Elif)

const elseBranch = createBranch((parser, sync) => {
    parser.match({
        expected: TokenType.K_Else,
        sync: union(sync, First.Structure.Body, TokenType.RBrace, First.Node, TokenType.LBrace),
        title: "Expected the keyword else here"
    })

    const body = parser.parseBody(sync, "else statement")

    return {
        is: "else-statement",
        body
    }
}, TokenType.K_Else)

const branch = branchGroup(ifBranch, elifBranch, elseBranch)

export function parseCondition(parser: Parser, sync: Set<TokenType>) {

    return parser.useBranch(branch, "Expected a valid condition start", sync)

}