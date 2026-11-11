import type { DataStructure } from "../parser/rules/data";
import type { FunctionNode } from "../parser/rules/function";
import type { ProgramNode } from "../parser/rules/program";
import { AnalyzerLogger } from "./logger";
import { analyzeDataStructure } from "./rules/data";
import { analyzeFunction } from "./rules/function";
import { analyzeProgram as runProgramRules } from "./rules/program";

// The communicator (analogous to DIFX for the parser).
export class Analyzer extends AnalyzerLogger {

    analyzeProgram(node: ProgramNode): void {
        runProgramRules(this, node);
    }

    analyzeDataStructure(node: DataStructure): void {
        analyzeDataStructure(this, node)
    }

    analyzeFunction(node: FunctionNode): void {
        analyzeFunction(this, node)
    }

    print(): void {
        for (const diag of this.diagnostics) diag.print();
    }

}