import { Tokenizer } from "../../lexer/tokenizer"
import { Token, TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";

const code = `std.(io, println, network.*)`
const tokenizer = new Tokenizer(code)
tokenizer.tokenize()
const tokens = tokenizer.tokens; //stream of tokens

const parser = new Parser(tokens, tokenizer.sourceContainer)

console.log(
    JSON.stringify(
        parser.module.parseModulePath(),
        null,
        2
    )
)

parser.print()