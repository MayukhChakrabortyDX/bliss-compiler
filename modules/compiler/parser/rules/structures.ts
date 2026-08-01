import type { Node } from "../globalAst";
import type { Parser } from "../parser";
import { EmptyNode } from "./node";

export function parseStructures(parser: Parser): Node {

    let branches = [
        parser.parseLoop,
        parser.parseFunction,
        parser.parseCondition
    ]

    for (let caller of branches) {

        const branch = parser.branchMode(() => caller())
        if (branch.status == false) {
            return branch.expr
        }

    }

    return new EmptyNode();

}