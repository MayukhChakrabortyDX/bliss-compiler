import type { TokenType } from "../../lexer/tokens"
import type { Parser } from "../parser"

export abstract class Production<T> {
    abstract first: Set<TokenType>
    abstract method(
        parser: Parser,
        sync: Set<TokenType>,
        diagnostics: string
    ): T
}