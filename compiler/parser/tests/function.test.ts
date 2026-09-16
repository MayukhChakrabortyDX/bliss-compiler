import { Tokenizer } from "../../lexer/tokenizer"
import { Parser } from "../parser";

const tokenizer = new Tokenizer(
`
allocator item {
    fx alloc(): Type {
    
    }
}

data x
data x(u8); 
data x[u8, 10]

data user {
    String name;
    age;
};

fx main(): i32 {

    loop {
        break;
    }

    if (true) {

    }
    elif (expected) 
    
    }
    else {
    
    }

    break;
}
`.replaceAll('\n', "\t")
)
tokenizer.tokenize()
const tokens = tokenizer.tokens; //stream of tokens

const parser = new Parser(tokens, tokenizer.sourceContainer)

const output = parser.parseProgramProduction()

console.log(JSON.stringify(output, null, 2))
parser.print()