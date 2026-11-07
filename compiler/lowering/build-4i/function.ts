//lowers the function production

import type { FunctionNode } from "../../parser/rules/build-4i/function";

export function lowerFunction(node: FunctionNode) {

    //returns a text
    return `void ${node.name}(void) {}`;

}