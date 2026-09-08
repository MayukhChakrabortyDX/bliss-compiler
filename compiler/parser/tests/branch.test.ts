// sample branching analysis test
// tests branching + implicit synchronization

import { Tokenizer } from "../../lexer/tokenizer";
import { TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";
import { Node, NodeType } from "../ast";
import {
    createBranch,
    branchGroup,
} from "../utility/branch";

// --------------------------------------------------
// Test input
// --------------------------------------------------

const code = `garbage garbage using garbage garbage fx`;

const tokenizer = new Tokenizer(code);
tokenizer.tokenize();

const tokens = tokenizer.tokens;

// --------------------------------------------------
// Pure productions
// --------------------------------------------------

function parseFunction(parser: Parser): Node {

    console.log("parseFunction called");

    parser.match({
        expected: TokenType.K_Fx,
        sync: new Set([TokenType.K_Fx, TokenType.K_Using, TokenType.EOF]),
        title: "Expected keyword 'fx'"
    });

    return new Node(NodeType.Function);
}

function parseUsing(parser: Parser): Node {

    console.log("parseUsing called");

    parser.match({
        expected: TokenType.K_Using,
        sync: new Set([TokenType.K_Fx, TokenType.K_Using, TokenType.EOF]),
        title: "Expected keyword 'using'"
    });

    return new Node(NodeType.Using);
}

// --------------------------------------------------
// Branch table
// --------------------------------------------------

const branches = branchGroup(

    createBranch(
        () => parseFunction(parser),
        TokenType.K_Fx
    ),

    createBranch(
        () => parseUsing(parser),
        TokenType.K_Using
    )

);

// --------------------------------------------------
// Parser
// --------------------------------------------------

const parser = new Parser(
    tokens,
    tokenizer.sourceContainer
);

// --------------------------------------------------
// Test branching
// --------------------------------------------------

console.log("Branching test:");

while (parser.peek().tokenType !== TokenType.EOF) {

    const node = parser.useBranch(
        branches,
        "Expected a valid top-level construct"
    );

    if (node.type !== NodeType.Empty) {
        console.log(
            "Produced node:",
            NodeType[node.type]
        );
    }
}

parser.print();