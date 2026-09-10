//the base class where all the rules will be used.

import type { TokenType } from "../lexer/tokens";
import { NodeType } from "./ast";
import { ParserBase } from "./base";
import { parseModuleAtom, parseModulePath } from "./rules/module";
import { useBranch, type BranchMap } from "./utility/branch";
import { useExtension, type ExtensionMap } from "./utility/extension";

export class Parser extends ParserBase {

    useBranch(branchTable: BranchMap, title: string, sync: Set<TokenType> = new Set(branchTable.keys())) {
       return useBranch(this, branchTable, title, sync)
    }

    useExtension<T, V>(overlap: () => T, extension: ExtensionMap<T, V>) {
        return useExtension(this, overlap, extension)
    }

    module = {
        parseModuleAtom: () => {
            return parseModuleAtom(this)
        },
        parseModulePath: () => {
            return parseModulePath(this)
        }
    }

}