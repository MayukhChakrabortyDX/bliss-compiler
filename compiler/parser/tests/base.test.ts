//sample token stream analysis test
//tests the ParserBase

import { Tokenizer } from "../../lexer/tokenizer"
import { Token, TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";

const code = `fx item) }`
const tokenizer = new Tokenizer(code)
tokenizer.tokenize()
const tokens = tokenizer.tokens; //stream of tokens

//sample function
function parseFunction(parser: Parser) {
    
    parser.match({
        expected: TokenType.K_Fx, 
        sync: new Set([TokenType.Identifier, TokenType.EOF]), 
        title: "Expected keyword 'fx'"
    })

    const name = 
        parser.digest({
            expected: TokenType.Identifier, 
            sync: new Set([TokenType.LBrace, TokenType.LBracket, TokenType.EOF]), 
            title: "Expected a valid function name"
        })

    parser.match({
        expected: TokenType.LBrace,
        sync: new Set([TokenType.LBracket, TokenType.EOF]),
        title: "Expected token '(' as start of arguments"
    })

    parser.match({
        expected: TokenType.RBrace,
        sync: new Set([TokenType.LBracket, TokenType.EOF]),
        title: "Expected token ')' as end of arguments"
    })

    parser.match({
        expected: TokenType.LBracket,
        sync: new Set([TokenType.RBracket, TokenType.EOF]),
        title: "Expected token '{' as start of body"
    })
    
    parser.match({
        expected: TokenType.RBracket,
        sync: new Set([TokenType.EOF]),
        title: "Expected token '}' as end of body"
    })
}

const parser = new Parser(tokens, tokenizer.sourceContainer)
parseFunction(parser)
parser.print()