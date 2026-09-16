import { Tokenizer } from "../../lexer/tokenizer"
import { Parser } from "../parser";

const tokenizer = new Tokenizer(
`
allocator item {

    fx alloc(): Type {
    
    }

}

fx main([u8] x): i32 {

    loop {

        break;

    }

    break;

`
)
tokenizer.tokenize()
const tokens = tokenizer.tokens; //stream of tokens

const parser = new Parser(tokens, tokenizer.sourceContainer)

const output = parser.parseProgramProduction()

console.log(JSON.stringify(output, null, 2))
parser.print()