export enum NodeType {
    Program
}

export class Node {

    typeName: string;
    start: number = 0;
    end: number = 0;

    constructor(public type: NodeType) {
        this.typeName = NodeType[type]
    }
}