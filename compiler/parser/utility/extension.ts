import type { Token, TokenType } from "../../lexer/tokens"
import type { Parser } from "../parser"

export type ExtensionMap<T, V> = Map<TokenType, (from: T) => V>

export function createExtension<T, V>(extension: (from: T) => V, ...associatedTokens: TokenType[]): ExtensionMap<T, V> {

    //generate a map
    const extensionMap = new Map<TokenType, (from: T) => V>()

    for ( let token of associatedTokens ) {
        extensionMap.set(token, extension)
    }

    return extensionMap

}

export function extensionGroup<T, V>(...extensions: ExtensionMap<T, V>[]): ExtensionMap<T, V> {

    const flattenMap: ExtensionMap<T, V> = new Map();

    for ( let extension of extensions ) {
        for ( let [key, value] of extension ) {
            flattenMap.set(key, value)
        }
    }

    return flattenMap

}

export function useExtension<T, V>(parser: Parser, overlap: () => T, extensions: ExtensionMap<T, V>) {

    const output = overlap()
    let fx = extensions.get(parser.peek().tokenType)

    if ( fx != undefined ) {
        return fx(output)
    }

    return output

}