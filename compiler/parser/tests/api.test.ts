import { Tokenizer } from "../../lexer/tokenizer";
import { TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";
import { union } from "../api/union";
import { program, ProgramNode } from "../rules/program";
import { loopProduction } from "../rules/loop";

const sampleProgram = 
`loop }`

const tokenizer = new Tokenizer(sampleProgram)
tokenizer.tokenize()
const parser = new Parser(tokenizer.tokens, tokenizer.sourceContainer)
const ast = (loopProduction.execute(parser, union(TokenType.EOF)) as ProgramNode)

//ast.span.end = tokenizer.tokens[tokenizer.tokens.length - 1]?.span.endIndex || 0

console.log(JSON.stringify(ast, null, 2))
parser.print()