//to be used by all ASTs (adopted basically) to store general properties of them

export enum ParseNodeEnum {
    Allocator, Function
}

export class ParseNode<T extends ParseNodeEnum> {

    span = {
        start: 0,
        end: 0
    }

    constructor(public kind: T) {}

    toString() {
        
        return {
            ...this,
            kind: ParseNodeEnum[this.kind] //so that the JSON output is readable atleast.
        }
        
    }

}