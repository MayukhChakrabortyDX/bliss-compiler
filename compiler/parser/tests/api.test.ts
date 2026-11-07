import { token, production, loop } from "../api/token";
import { Tokenizer } from "../../lexer/tokenizer";
import { TokenType } from "../../lexer/tokens";
import { Parser } from "../parser";
import { union } from "../utility/union";
import { nterm } from "../api/token";

const sampleProgram = `fx fx main(): i {} return`

const functionHead = production(
    token(TokenType.K_Fx).err("Expected the keyword fx"),
    token(TokenType.Identifier).save().err("Expected the name of the function"),
    token(TokenType.LBrace).err("Expected start of argument bracket '('"),
    token(TokenType.RBrace).err("Expected end of argument bracket ')'")
).ast(name => {
    return name
})

const functionType = production(
    token(TokenType.Colon).err('Expected a colon to indicate the return type'),
    token(TokenType.Identifier).save().err('Expected the type itself')
).ast(type => type)

const functionBody = production(
    token(TokenType.LBracket).err("Expected '{'"),
    token(TokenType.RBracket).err("Expected '}'")
)

const functionProduction = production(
    nterm(functionHead).save(),
    nterm(functionType).save(),
    nterm(functionBody)
)
    .ast((name: string, type: string) => {

        return {
            name, type
        }

    })

const programProduction = production(
    loop({
        prod: nterm(functionProduction),
        deliminator: token(TokenType.EOF)
    }).save()
).ast((functions) => functions)

const tokenizer = new Tokenizer(sampleProgram)
tokenizer.tokenize()
const parser = new Parser(tokenizer.tokens, tokenizer.sourceContainer)
const ast = programProduction.execute(parser, union(TokenType.EOF))

console.log(ast)
parser.print()