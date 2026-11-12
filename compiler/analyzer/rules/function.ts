import type { FunctionNode } from "../../parser/rules/function";
import type { Analyzer } from "../analyzer";
import { AnalyzerDiagnostic, type DiagnosticError } from "../diagnostic";

export function analyzeFunction(analyzer: Analyzer, node: FunctionNode, identifiers: Set<string>) {

    //analyze if the types are identical then that's an issue
    const types = new Set<string>()
    let errorSpans: DiagnosticError[] = []

    if (identifiers.has(node.name)) {
        errorSpans.push(
            { span: node.name_span, message: "This identifier was already defined" }
        )
    }

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
            new AnalyzerDiagnostic("Issues in function structure", errorSpans, analyzer)
        )
    }
}