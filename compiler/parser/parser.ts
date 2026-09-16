//the base class where all the rules will be used.

import { TokenType } from "../lexer/tokens";
import { ParserLogger } from "./logger";
import { parseAllocator } from "./rules/allocator";
import { parseCondition } from "./rules/condition";
import { parseFunction, parseFunctionHead } from "./rules/function";
import { parseLoop } from "./rules/loop";
import { parseModifier } from "./rules/modifiers";
import { parseImport, parseUsing } from "./rules/module";
import { parseAtom, parseNode } from "./rules/node";
import { parseProgramProduction } from "./rules/program";
import { parseBody, parseStructure } from "./rules/structure";
import { parseType } from "./rules/types";
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

export class Parser extends ParserLogger {

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

            //console.log(TokenType[token.tokenType])

            this.match({
                expected: separator,
                sync: productionSync,
                title: titles.separatorMissing
            })

        }


    }

    parseProgramProduction() {
        return parseProgramProduction(this)
    }

    parseFunction(sync: Set<TokenType>) {
        return parseFunction(this, sync)
    }

    parseLoop(sync: Set<TokenType>) {
        return parseLoop(this, sync)
    }

    parseModifier(sync: Set<TokenType>) {
        return parseModifier(this, sync)
    }

    parseImport(sync: Set<TokenType>) {
        return parseImport(this, sync)
    }

    parseUsing(sync: Set<TokenType>) {
        return parseUsing(this, sync)
    }

    parseAtom(sync: Set<TokenType>) {
        return parseAtom(this, sync)
    }

    parseNode(sync: Set<TokenType>) {
        return parseNode(this, sync)
    }

    parseStructure(sync: Set<TokenType>) {
        return parseStructure(this, sync)
    }

    parseBody(sync: Set<TokenType>, belongs: string) {
        return parseBody(this, sync, belongs)
    }

    parseType(sync: Set<TokenType>) {
        return parseType(this, sync)
    }

    parseAllocator(sync: Set<TokenType>) {
        return parseAllocator(this, sync)
    }

    parseCondition(sync: Set<TokenType>) {
        return parseCondition(this, sync)
    }

    parseFunctionHead(sync: Set<TokenType>) {
        return parseFunctionHead(this, sync)
    }

}