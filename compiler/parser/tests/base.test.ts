//sample token stream analysis test
//tests the ParserBase

import { Tokenizer } from "../../lexer/tokenizer"
import { TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";

const code = `fx () {}`
const tokenizer = new Tokenizer(code)
tokenizer.tokenize()
const tokens = tokenizer.tokens; //stream of tokens

//sample function
function parseFunction(parser: Parser) {

}

const parser = new Parser(tokens, tokenizer.sourceContainer)
console.log(parseFunction(parser))