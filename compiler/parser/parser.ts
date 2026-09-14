//the base class where all the rules will be used.

import { TokenType, type Token } from "../lexer/tokens";
import { ParserBase } from "./base";
import { useBranch, type BranchMap } from "./utility/branch";
import { useExtension, type ExtensionMap } from "./utility/extension";
import { union } from "./utility/union";

type loopType<T> = {
    callback: (output: T) => void,
    production: (parser: Parser, sync: Set<TokenType>) => T,
    deliminator: TokenType,
    separator: TokenType,
    first: Set<TokenType>,
    sync: Set<TokenType>,
    titles: {
        closing: string,
        separator: string,
        separatorMissing: string
    }
}

type loopWithoutSeparator<T> = {
    callback: (output: T) => void,
    production: (parser: Parser, sync: Set<TokenType>) => T,
    deliminator: TokenType,
    first: Set<TokenType>,
    sync: Set<TokenType>,
    titles: {
        closing: string,
        invalidToken: string
    }
}

export class Parser extends ParserBase {

    useBranch(branchTable: BranchMap, title: string, sync: Set<TokenType>) {
        return useBranch(this, branchTable, title, sync)
    }

    useExtension<T, V>(overlap: () => T, extension: ExtensionMap<T, V>, sync: Set<TokenType>) {
        return useExtension(this, overlap, extension, sync)
    }

    //what happens without a separator?

    useLoopWithoutSeparator<T>({
        callback, production, deliminator, first, sync, titles
    }: loopWithoutSeparator<T>) {

        const productionSync = union(sync, deliminator, first)

        callback(
            production(
                this,
                productionSync
            )
        )

        while (true) {
            
            const token = this.peek()

            if (
                sync.has(token.tokenType) &&
                token.tokenType != deliminator &&
                !first.has(token.tokenType)
            ) {
                this.syncToken(false, sync, titles.closing, token)
                break
            }

            if (token.tokenType == deliminator) {

                this.advance()
                break

            }

            if (first.has(token.tokenType)) {

                callback(
                    production(
                        this,
                        productionSync
                    )
                )

                continue;

            }

            //anything else is not entertained
            this.syncToken(false, productionSync, titles.invalidToken, token)

        }

    }

    useLoop<T>({
        callback, production, deliminator, separator, first, sync, titles
    }: loopType<T>) {

        const productionSync = union(sync, separator, deliminator, first)
        //we first call the production here and pass it off.
        callback(
            production(
                this,
                productionSync
            )
        )

        while (true) {

            const token = this.peek()

            if (
                sync.has(token.tokenType) &&
                token.tokenType != separator &&
                token.tokenType != deliminator &&
                !first.has(token.tokenType)
            ) {

                this.syncToken(false, sync, titles.closing, token)
                break

            }

            if (token.tokenType == deliminator) {

                this.advance()
                break

            }

            if (first.has(token.tokenType)) {

                this.report(titles.separator, token)
                callback(
                    production(
                        this,
                        productionSync
                    )
                )

                continue;

            }

            if (separator == token.tokenType) {

                this.advance()
                callback(
                    production(
                        this,
                        productionSync
                    )
                )

                continue;

            }

            this.match({
                expected: separator,
                sync: union(sync, deliminator, first),
                title: titles.separatorMissing
            })

        }

    }

    static productions = {
        atom: {
            first:
                new Set([
                    TokenType.Identifier, TokenType.RealNumber,
                    TokenType.Integer, TokenType.String,
                    TokenType.LBrace, TokenType.LSquareBrace,
                    TokenType.HashSymbol, TokenType.Backtick,
                    TokenType.K_Adrs, TokenType.K_Sizeof
                ])
        }
    }

}