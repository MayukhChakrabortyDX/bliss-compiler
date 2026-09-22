//to be used by all ASTs (adopted basically) to store general properties of them

export enum ParseNodeEnum {
    Program,
    Allocator, 
    //functions
    Function, FunctionHead, ArgList,
    //condition nodes
    IfBranch, ElifBranch, ElseBranch,
    //operator nodes
    BinaryOperator, UnaryOperator,
    //daop
    Action, DataField, DataLayout, Alias, Bind,
    //type system
    DataType,
    //loops
    Loop,
    //structure
    BlockBody,
    //nodes
    Atom, Node, Array, Allocation,
    //modifiers
    Modifier,
    //modules
    Import, Using
}

export enum BinaryOperatorEnum {
    Assignment, Equality, Inequality, Sum,
    LessThan, GreaterThan, LessThanEqual, GreaterThanEqual, 
    Product, Subtraction, Division, Access, 
    Magnetic, Binding
}

export enum UnaryOperatorEnum {

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