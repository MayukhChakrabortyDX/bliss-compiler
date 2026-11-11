import type { FunctionNode } from "../../parser/rules/function";
import type { Analyzer } from "../analyzer";
import { AnalyzerDiagnostic, type DiagnosticError } from "../diagnostic";

export function analyzeFunction(analyzer: Analyzer, node: FunctionNode) {

    //analyze if the types are identical then that's an issue
    const types = new Set<string>()
    let errorSpans: DiagnosticError[] = []

    for (let type of node.args.args) {
        if (types.has(type.name)) {
            errorSpans.push(
                { span: type.name_span, message: "This argument was used already" }
            );
        } else {
            types.add(type.name);
        }
    }

    if (errorSpans.length != 0) {
        analyzer.diagnostics.push(
            new AnalyzerDiagnostic("Duplicate Argument Names", errorSpans, analyzer)
        )

    }
}