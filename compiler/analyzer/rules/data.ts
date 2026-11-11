import type { DataStructure } from "../../parser/rules/build-4i/data";
import type { Analyzer } from "../analyzer";
import { AnalyzerDiagnostic } from "../diagnostic";

export function analyzeDataStructure(analyzer: Analyzer, node: DataStructure) {

    //analyze if the types are identical then that's an issue
    const types = new Set<string>()

    for (let type of node.body) {
        if (types.has(type.name)) {
            analyzer.diagnostics.push(
                new AnalyzerDiagnostic(
                    "Duplicate Field Name",
                    [{ span: type.name_span, message: "This field was used already" }],
                    analyzer
                )
            );
            continue;
        }

        types.add(type.name);
    }

}