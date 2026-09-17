import { Tokenizer } from "../../lexer/tokenizer"
import { Parser } from "../parser";

const tokenizer = new Tokenizer(
`fx print([NotBuiltIn] pointer): void {

    let var: SomeRandomType = 10;

}`
)

tokenizer.tokenize()
const tokens = tokenizer.tokens; //stream of tokens

const parser = new Parser(tokens, tokenizer.sourceContainer)

const output = parser.parseProgramProduction()

console.log(JSON.stringify(output, null, 2))
parser.print()