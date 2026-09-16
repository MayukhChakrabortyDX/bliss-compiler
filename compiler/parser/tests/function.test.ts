import { Tokenizer } from "../../lexer/tokenizer"
import { Parser } from "../parser";

const tokenizer = new Tokenizer(
`
allocator item {
    fx alloc(): Type {
    
    }
}

fx main(): i32 {

    loop {
        break;
    }

    if (true) {

    }
    elif (expected) {
    
    }
    else {
    
    }

    break;
}
`
)
tokenizer.tokenize()
const tokens = tokenizer.tokens; //stream of tokens

const parser = new Parser(tokens, tokenizer.sourceContainer)

const output = parser.parseProgramProduction()

console.log(JSON.stringify(output, null, 2))
parser.print()