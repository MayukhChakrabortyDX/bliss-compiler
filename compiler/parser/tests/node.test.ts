import { Tokenizer } from "../../lexer/tokenizer"
import { TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";
import { ImportProduction } from "../rules/module";
import { Node } from "../rules/node";
import { ProgramProduction } from "../rules/program";
import { recoveryMonster } from "./node_test/error_monster";
import { validMonster } from "./node_test/valid_monster";

const tokenizer = new Tokenizer(`let x: Type::(A, BV) = Runnner::X.call(10, value=20);`)
tokenizer.tokenize()
const tokens = tokenizer.tokens; //stream of tokens

const parser = new Parser(tokens, tokenizer.sourceContainer)

const output = Node.parse(parser, new Set([ TokenType.EOF ]))

console.log(JSON.stringify(output, null, 2))
parser.print()
