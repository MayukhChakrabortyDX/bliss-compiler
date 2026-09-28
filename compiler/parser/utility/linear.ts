//linear helps us to manage multiple productions with ease
//instead of us having to manage them manually, and with
//caching support!

import type { TokenType } from "../../lexer/tokens";
import type { Parser } from "../parser";
import { union } from "./union";

/**
 * 
 * Kinds of inputs:
 * 1. token, and error message when token is not available
 * 2. a production function, taking production and sync (that's all)
 * 
 */

export type TerminalAPI = {
    first: Set<TokenType>,
    parse: (parser: Parser, sync: Set<TokenType>) => any,
    as?: string
}

export function terminal<T>(cache: string, parser: Parser, sync: Set<TokenType>, ...items: TerminalAPI[]) {

    if (parser.cache.has(cache)) {
        items = parser.cache.get(cache)
    } else {
        for (let index = items.length - 1; index >= 0; index--) {
            if (index != items.length - 1) {
                (items[index] as TerminalAPI).first = union(
                    (items[index + 1] as TerminalAPI).first,
                    (items[index] as TerminalAPI).first
                );
            }

            (items[index] as TerminalAPI).first = union(
                sync,
                (items[index] as TerminalAPI).first
            );

        }
        parser.cache.set(cache, items)
    }

    //@ts-ignore
    let accumulator: T = {};
    for (let item of items) {
        
        if (item.as != undefined) {
            //@ts-ignore
            accumulator[item.as] = item.parse(parser, item.first)
        } else {
            item.parse(parser, item.first)
        }
    }

    return accumulator

}

export function token(tok: TokenType, message: string) {
    return {
        first: union(tok),
        parse: (parser: Parser, sync: Set<TokenType>) => {
            parser.match({
                expected: tok,
                sync,
                title: message
            })
        }
    }
}

export function digest(tok: TokenType, message: string, as: string) {
    return {
        first: union(tok),
        parse: (parser: Parser, sync: Set<TokenType>) => {
            return parser.digest({
                expected: tok,
                sync,
                title: message
            })
        },
        as
    }
}

export function nterm(parse: (parser: Parser, sync: Set<TokenType>) => any, first: Set<TokenType>, as: string) {
    return {
        first, parse, as
    }
}