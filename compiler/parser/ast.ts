import type { StringSpan } from "../lexer/tokens";

export enum NodeType {
    Program, Empty, Function, Using, Identifier,
    IncludeAllPath, IncludePath, BinaryOps
}

export class Node {

    typeName: string;
    start: number = 0;
    end: number = 0;

    constructor(public type: NodeType) {
        this.typeName = NodeType[type]
    }
}

//utility nodes
export class EmptyNode extends Node {
    
    constructor(public name? : string) {
        super(NodeType.Empty)
    }

}

export class Identifier extends Node {
    constructor(public value: string) {
        super(NodeType.Identifier)
    }
}

export enum BinaryOpsEnum {
    IncludePath
}

export class BinaryOperatorNode extends Node {
    constructor(public left: Node, public right: Node, public ops: BinaryOpsEnum) {
        super(NodeType.BinaryOps)
    }
}