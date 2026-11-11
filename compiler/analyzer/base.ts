import type { StringContainer } from "../lexer/tokens";
import type { ProgramNode } from "../parser/rules/program";
import type { AnalyzerDiagnostic } from "./diagnostic";

export class AnalyzerBase {

    diagnostics: AnalyzerDiagnostic[] = [];

    // The analyzer always starts with a program node.
    constructor(
        public program: ProgramNode,
        public source: StringContainer
    ) { }

}