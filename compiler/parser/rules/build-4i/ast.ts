//to be used by all ASTs (adopted basically) to store general properties of them

export enum ASTEnum {
    PROGRAM,
    FUNCTION
}

export class AST<T extends ASTEnum> {

    span = {
        start: 0,
        end: 0
    }

    constructor(public kind: T) {}

    toJSON() {
        
        return {
            ...this,
            kind: ASTEnum[this.kind] //so that the JSON output is readable atleast.
        }
        
    }

}