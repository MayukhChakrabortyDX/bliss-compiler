export enum NodeType {
    Program, Empty, Function, Using, Identifier
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
    
    constructor() {
        super(NodeType.Empty)
    }

}