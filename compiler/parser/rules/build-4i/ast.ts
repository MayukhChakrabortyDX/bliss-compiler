//to be used by all ASTs (adopted basically) to store general properties of them

export enum ASTEnum {
    PROGRAM,
    FUNCTION,
    EMPTY_BRANCH,
    TYPE_SYSTEM,
    FUNCTION_ARGS
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