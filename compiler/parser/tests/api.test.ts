import { Tokenizer } from "../../lexer/tokenizer";
import { TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";
import { union } from "../api/union";
import { program, ProgramNode } from "../rules/program";
import { lowerProgram } from "../../lowering/program";
import { Analyzer } from "../../analyzer";

const sampleProgram = 
`
fx main( data a: i32, data b: u64 ) {}
fx add( data a: i32, data b: u64 ) {}

data Hello {

	data x: i32;
	data y: i32;

}

action Hello {
	fx add( data a: i32, data b: u64 );
}
`

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