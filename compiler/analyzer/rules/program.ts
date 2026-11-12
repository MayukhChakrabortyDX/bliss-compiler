import { AST, ASTEnum } from "../../parser/rules/ast";
import type { ProgramNode } from "../../parser/rules/program";
import type { Analyzer } from "../analyzer";   // type-only: no runtime cycle

//! WE ALSO WANT TO ANALYZE DATA STRUCTURES AND FUNCTIONS AND THEIR TYPES, BUT
//! THIS IS NOT A PRIORITY NOW.

export function analyzeProgram(analyzer: Analyzer, node: ProgramNode): void {

    const identifiers = new Set<string>();
    const actions = new Set<string>();
    const datas = new Set<string>();
    const binds = new Set<string>();

    for (const item of node.body) {

        if ( item.kind == ASTEnum.ACTION ) {
            //! ANALYSIS FOR THE ACTIONS ARE PENDING
            actions.add(item.name)
            identifiers.add(item.name)
        }

        if ( item.kind == ASTEnum.DATA_STRUCTURE ) {
            analyzer.analyzeDataStructure(item)
            datas.add(item.name)
            identifiers.add(item.name)
        }

        if ( item.kind == ASTEnum.FUNCTION ) {
            analyzer.analyzeFunction(item, identifiers)
            identifiers.add(item.name)
        }

        if ( item.kind == ASTEnum.BIND ) {
            analyzer.analyzeBind(item, actions, datas, identifiers)
            identifiers.add(item.bindingName)
            binds.add(item.bindingName)
        }

    }
}