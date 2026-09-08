//the base class where all the rules will be used.

import { ParserBase } from "./base";
import { useBranch, type BranchMap } from "./utility/branch";
import { useExtension, type ExtensionMap } from "./utility/extension";

export class Parser extends ParserBase {

    useBranch(branchTable: BranchMap) {
        return useBranch(this, branchTable)
    }

    useExtension<T, V>(overlap: () => T, extension: ExtensionMap<T, V>) {
        return useExtension(this, overlap, extension)
    }

}