import { Tokenizer } from "../../lexer/tokenizer"
import { TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";
import { union } from "../utility/union";

const code =
`
import std.io.println.(item, x.software.*
`
const tokenizer = new Tokenizer(code)
tokenizer.tokenize()
const tokens = tokenizer.tokens; //stream of tokens

const parser = new Parser(tokens, tokenizer.sourceContainer)

const output = parser.parseImport(union(TokenType.EOF))
parser.print()

//console.log(JSON.stringify(output, null, 2))