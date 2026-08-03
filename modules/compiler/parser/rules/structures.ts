import type { Node } from "../globalAst";
import type { Parser } from "../parser";

export function parseStructures(parser: Parser): Node {

    let branches = [
        () => parser.parseLoop(),
        () => parser.parseFunction(),
        () => parser.parseCondition()
    ]

    return parser.useBranch(branches, "Invalid structure for loop, function and condition")

}