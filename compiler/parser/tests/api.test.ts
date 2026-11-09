import { token, production, loop } from "../api/token";
import { Tokenizer } from "../../lexer/tokenizer";
import { TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";
import { union } from "../utility/union";
import { program, ProgramNode } from "../rules/build-4i/program";
import { lowerProgram } from "../../lowering/build-4i/program";
import { Analyzer } from "../../analyzer";
import { typeSystem } from "../rules/build-4i/type";

const sampleProgram = `fx main(data api: u64, data npi: i32) {}`

const tokenizer = new Tokenizer(sampleProgram)
tokenizer.tokenize()
const parser = new Parser(tokenizer.tokens, tokenizer.sourceContainer)
const ast = (program.execute(parser, union(TokenType.EOF)) as ProgramNode)

ast.span.end = tokenizer.tokens[tokenizer.tokens.length - 1]?.span.endIndex || 0

console.log(JSON.stringify(ast, null, 2))
parser.print()

//now analyze
const analyzer = new Analyzer(ast, tokenizer.sourceContainer)
analyzer.analyzeProgram(ast)
analyzer.print()

//produce the output
const output = lowerProgram(ast)
console.log(output)