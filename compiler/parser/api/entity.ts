import { TokenType } from "../../lexer/tokens"
import type { Parser } from "../parser"

export enum EntityKind {
    PROD, TOKEN
}

export class ProductionEntity {

    kind: EntityKind = EntityKind.PROD
    save_result: boolean = false
    syncs_with: Set<TokenType> = new Set() //to be populated by the production function itself
    
    constructor(
        public token: Set<TokenType>,
        public method: (parser: Parser, sync: Set<TokenType>) => any
    ) {}

    save() {
        this.save_result = true
        return this
    }

}

export class TokenEntity {

    kind: EntityKind = EntityKind.TOKEN
    error: string = ""
    save_result: boolean = false
    syncs_with: Set<TokenType> = new Set() //to be populated by the production function itself.

    constructor(public token: TokenType) {}

    err(message: string) {
        this.error = message
        return this
    }

    save() {
        this.save_result = true
        return this
    }

}