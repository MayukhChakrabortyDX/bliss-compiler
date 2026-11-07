import { TokenType } from "../../lexer/tokens";
import type { Parser } from "../parser";
import { union } from "../utility/union";
import { EntityKind, ProductionEntity, TokenEntity } from "./entity";

//! A Production can have many first-token value (as evident by branches)
//! So we will later use sets for first-token initiation.

export class ProductionInstance {

    callback: (...args: any[]) => any = () => {}
    constructor(public first: TokenType, public run: (parser: Parser, sync: Set<TokenType>) => any[]) { }

    ast(callback: (...args: any[]) => any) {
        this.callback = callback
        return this
    }

    execute(parser: Parser, sync: Set<TokenType>) {
        return this.callback(...this.run(parser, sync))
    }

}

export function production(...tokens: (TokenEntity | ProductionEntity)[]) {

    //takes an array of tokens and processes the output.
    //we will NOT implement any sort of caching just yet. We will wait it out.

    //step 1 - create the sync step.
    for (let index = tokens.length - 2; index >= 0; index--) {

        const now = tokens[index] as (TokenEntity | ProductionEntity)
        const next = tokens[index + 1] as (TokenEntity | ProductionEntity)

        now.syncs_with = union(next.token, next.syncs_with)
    }

    //step 2 - construct the production function - executed with syncs

    const execute = (parser: Parser, sync: Set<TokenType>) => {

        const args: any[] = []

        for (let item of tokens) {

            if (item.save_result) {

                if (item.kind == EntityKind.TOKEN) {
                    args.push(
                        parser.digest({
                            expected: item.token,
                            sync: union(sync, item.syncs_with),
                            title: (item as TokenEntity).error
                        })
                    )
                } else {
                    args.push(
                        (item as ProductionEntity).method(parser, sync)
                    )
                }

            } else {

                if (item.kind == EntityKind.TOKEN) {
                    parser.match({
                        expected: item.token,
                        sync: union(sync, item.syncs_with),
                        title: (item as TokenEntity).error
                    })
                } else {
                    (item as ProductionEntity).method(parser, sync);
                }

            }

        }

        return args

    }

    return new ProductionInstance(
        (tokens[0] as TokenEntity).token,
        execute,
    )

}

export function token(token: TokenType) {
    return new TokenEntity(token)
}

export function nterm(production: ProductionInstance) {
    return new ProductionEntity(
        production.first,
        (parser, sync) => production.execute(parser, sync)        
    )
}

export function loop(
    { prod, separator, deliminator, allowEmpty=true }:
        { prod: ProductionEntity, separator?: TokenEntity, deliminator: TokenEntity, allowEmpty?: boolean }
) {

    const method = (parser: Parser, sync: Set<TokenType>) => {

        const items: any[] = []
        let loopSync;

        if ( separator != undefined ) {
            loopSync = union(sync, prod.token, deliminator.token, separator.token)
        } else {
            loopSync = union(sync, prod.token, deliminator.token)
        }
        
        if ( allowEmpty ) {

            //this means we can have empty components
            if ( parser.peek().tokenType == deliminator.token ) {
                parser.advance()
                return items
            }

        }

        //otherwise we will start with a single production match
        const firstProduction = production(prod.save()).ast((item) => items.push(item))
        firstProduction.execute(parser, loopSync)

        let loopProduction;

        if ( separator != undefined ) {
            loopProduction = production(
                separator,
                prod.save()       
            ).ast((item) => items.push(item))
        }

        while(true) {

            //now we are going to handle errors.

            const token = parser.peek()

            if ( token.tokenType == deliminator.token ) {
                parser.advance()
                return items
            }   

            if ( token.wasSyncedTo ) {

                if ( separator != undefined ) {

                    if ( token.tokenType != separator.token && token.tokenType != prod.token ) {

                        //if it's neither a separator or a production first token or even a delim
                        //that means we return. This is the end stage
                        return items

                    }

                }

                if ( token.tokenType != prod.token ) {
                    return items
                }
                
            }

            if ( separator != undefined ) {
                loopProduction?.execute(parser, loopSync)
            } else {
                firstProduction.execute(parser, loopSync)
            }

        }

    }

    return new ProductionEntity(
        prod.token,
        method
    )

}