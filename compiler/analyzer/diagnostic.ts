import type { StringSpan } from "../lexer/tokens";
import type { AnalyzerLogger } from "./logger";

export interface DiagnosticError {
    span: StringSpan;
    message: string;
}

export class AnalyzerDiagnostic {

    constructor(
        public title: string,
        public errors: DiagnosticError[],
        // Type-only: only the logging capability is needed here.
        public analyzer: AnalyzerLogger
    ) { }

    print(): void {
        this.analyzer.logDiagnostic(this);
    }

}