import { ASTEnum } from "../../parser/rules/ast";
import type { ProgramNode } from "../../parser/rules/program";
import type { Analyzer } from "../analyzer";   // type-only: no runtime cycle
import { AnalyzerDiagnostic } from "../diagnostic";

//! WE ALSO WANT TO ANALYZE DATA STRUCTURES AND FUNCTIONS AND THEIR TYPES, BUT
//! THIS IS NOT A PRIORITY NOW.

export function analyzeProgram(analyzer: Analyzer, node: ProgramNode): void {

    const names = new Set<string>();

    for (const item of node.body) {

        if ( item.kind == ASTEnum.DATA_STRUCTURE ) {
            analyzer.analyzeDataStructure(item)
        }

        if ( item.kind == ASTEnum.FUNCTION ) {
            analyzer.analyzeFunction(item)
        }

        if (names.has(item.name)) {
            analyzer.diagnostics.push(
                new AnalyzerDiagnostic(
                    "Duplicate Function Name",
                    [{ span: item.name_span, message: "This identifier was used already" }],
                    analyzer
                )
            );
            continue;
        }

        names.add(item.name);
    }
}