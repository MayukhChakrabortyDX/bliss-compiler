import type { ProgramNode } from "../../parser/rules/build-4i/program";
import type { Analyzer } from "../analyzer";   // type-only: no runtime cycle
import { AnalyzerDiagnostic } from "../diagnostic";

export function analyzeProgram(analyzer: Analyzer, node: ProgramNode): void {

    const functionNames = new Set<string>();

    for (const fx of node.functions) {

        if (functionNames.has(fx.name)) {
            analyzer.diagnostics.push(
                new AnalyzerDiagnostic(
                    "Duplicate Function Name",
                    [{ span: fx.name_span, message: "A function with this name exists already." }],
                    analyzer
                )
            );
            continue;
        }

        functionNames.add(fx.name);
    }
}