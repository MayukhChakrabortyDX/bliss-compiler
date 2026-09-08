import { Tokenizer } from "../lexer/tokenizer";


const program = 
`fx main() {
    "Hello World"->console.log()?;
}`
;
const tokenizer = new Tokenizer(program);
tokenizer.tokenize();
