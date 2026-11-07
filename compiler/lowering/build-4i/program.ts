import type { ProgramNode } from "../../parser/rules/build-4i/program";
import { lowerFunction } from "./function";

export function lowerProgram(node: ProgramNode) {

    let program = ``

    for ( let fx of node.functions ) {
        program = `${program}\n${lowerFunction(fx)}`
    }

    return program

}