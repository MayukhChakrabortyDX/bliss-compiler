import { ASTEnum } from "../../parser/rules/ast";
import type { ProgramNode } from "../../parser/rules/program";
import { lowerDataStructure } from "./data";
import { lowerFunction } from "./function";

export function lowerProgram(node: ProgramNode) {

    let program = ``

    for ( let item of node.body ) {
        if ( item.kind == ASTEnum.FUNCTION ) {
            program = `${program}\n${lowerFunction(item)}`
        } else if ( item.kind == ASTEnum.DATA_STRUCTURE ) {
            program = `${program}\n${lowerDataStructure(item)}`
        }
    }

    return `#include <stdint.h>\n${program}`

}