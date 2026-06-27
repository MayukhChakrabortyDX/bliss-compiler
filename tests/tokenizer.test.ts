import { Parser } from "../modules/compiler/parser/parser";
import { Tokenizer } from "../modules/compiler/tokenizer/tokenizer";
import { readFileSync } from "fs";

const rawSource = readFileSync("input.txt", "utf8")

//console.log(rawSource.substring(1400, 1506))

export const TestTokenizer = () => {
    const source = rawSource;
    //console.log(source)
    const tokenize = new Tokenizer(source)
    let x = tokenize.tokenize()
    const parser = new Parser(tokenize.tokens, tokenize.sourceContainer);

    //console.log(JSON.stringify(x.map(v => source.substring(v.span.startIndex, v.span.endIndex + 1))))
    console.log(JSON.stringify(parser.parseProgram(), null, 2));


    // //we will test the emitter too.
    // const emitter = new CEmitter()
    // console.log(
    //     emitter.emit(parser.parseProgram())
    // )
}