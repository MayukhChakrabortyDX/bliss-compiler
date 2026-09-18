import { Tokenizer } from "../../lexer/tokenizer"
import { Parser } from "../parser";

const tokenizer = new Tokenizer(
`
allocator malloc {

    fx allocate(): [u8] {
    }

    fx deallocate(): void {
    }

}
`
)

tokenizer.tokenize()
const tokens = tokenizer.tokens; //stream of tokens

const parser = new Parser(tokens, tokenizer.sourceContainer)

const output = parser.parseProgramProduction()

console.log(JSON.stringify(output, null, 2))
parser.print()