import { TokenType } from "../../lexer/tokens"
import type { Parser } from "../parser"
import { BranchEmpty } from "./token"

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
    ) { }

    save() {
        this.save_result = true
        return this
    }

    saveAs(callback: (modifier: any) => any) {

        this.method = (parser: Parser, sync: Set<TokenType>) => {
            return callback(this.method(parser, sync))
        }

        return this

    }

}

export class BranchEntity extends ProductionEntity {

    error: string = "Invalid branch"
    def: any = new BranchEmpty()

    //we add few more methods specially for branch entity
    err(msg: string) {
        this.error = msg
        return this
    }

    defaultReturn(item: any) {
        this.def = item
        return this
    }

}

export class TokenEntity {

    kind: EntityKind = EntityKind.TOKEN
    error: string = ""
    save_result: boolean = false
    syncs_with: Set<TokenType> = new Set() //to be populated by the production function itself.

    constructor(public token: TokenType) { }

    err(message: string) {
        this.error = message
        return this
    }

    save() {
        this.save_result = true
        return this
    }

}