import type { ProgramNode } from "../parser/rules/build-4i/program";
import { AnalyzerLogger } from "./logger";
import { analyzeProgram as runProgramRules } from "./rules/program";

// The communicator (analogous to DIFX for the parser).
export class Analyzer extends AnalyzerLogger {

    analyzeProgram(node: ProgramNode): void {
        runProgramRules(this, node);
    }

    print(): void {
        for (const diag of this.diagnostics) diag.print();
    }

}