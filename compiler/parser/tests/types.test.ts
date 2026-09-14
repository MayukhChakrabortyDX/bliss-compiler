import { Tokenizer } from "../../lexer/tokenizer"
import { TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";
import { ImportProduction } from "../rules/module";
import { ProgramProduction } from "../rules/program";
import { Type } from "../rules/types";

const tokenizer = new Tokenizer(`#\`f322::(A, B, C)[10]`)
tokenizer.tokenize()
const tokens = tokenizer.tokens; //stream of tokens

const parser = new Parser(tokens, tokenizer.sourceContainer)

const output = Type.parse(parser, new Set([ TokenType.EOF ]))
console.log(JSON.stringify(output, null, 2))

parser.print()