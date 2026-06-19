import type { StringContainer, StringSpan } from "./tokens"

//declare nodes based on rules
export enum NodeType {
    Program, FunctionDefinition, 
    ReturnStatement, Identifier, 
    Number, BinaryOperationExpression, 
    Import, Using, 
    String, Break, 
    Loop, ConditionUnit, 
    Condition, CallSignature,
    CallStatement
}

export class Node {

    typeName: string;
    
    constructor(public type: NodeType) {
        this.typeName = NodeType[type]
    }
}

export class FunctionDefinitionNode extends Node {
    constructor(public name: string, public body: StatementNode[]) {
        super(NodeType.FunctionDefinition)
    }
}

export class LoopNode extends Node {
    constructor(public body: StatementNode[], public identifier?: string) {
        super(NodeType.Loop)
    }
}

//based purely off production rules
export class ProgramNode extends Node {

    constructor(public functionArray: FunctionDefinitionNode[], public importList: ImportNode[]) {
        super(NodeType.Program)
    }

}

export class ReturnStatementNode extends Node {

    constructor(public expression?: Expression) {
        super(NodeType.ReturnStatement)
    }

}

export class BreakStatementNode extends Node {
    constructor(public identifier?: string) {
        super(NodeType.Break)
    }
}

export class IdentifierNode extends Node {

    constructor( public name: string ) {
        super(NodeType.Identifier)
    }

}

export class ImportNode extends Node {
    constructor( public moduleSequence: string[] ) {
        super(NodeType.Import)
    }
}

export class UsingNode extends Node {
    constructor( public moduleSequence: string[] ) {
        super(NodeType.Using)
    }
}

export enum Number {
    Real, Integer
}

export class NumberNode extends Node {

    constructor( public value: string, public subtypes: Number.Real | Number.Integer ) {
        super(NodeType.Number)
    }

}

export class StringNode extends Node {
    constructor( public span: StringSpan) {
        super(NodeType.String)
    }
}

export enum BinaryOperation {
    Multiply, Divide, Add, Subtract,
    GreaterThan, LessThan, GreaterThanEqual, LessThanEqual,
}

export class BinaryOperatorNode extends Node {
    constructor( public left: Expression, public right: Expression, public operator: BinaryOperation ) {
        super(NodeType.BinaryOperationExpression)
    }

}

export class ConditionalNode extends Node {
    constructor(public conditionBody: StatementNode[], public condition?: Expression) {
        super(NodeType.ConditionUnit)
    }
}

export class ConditionNode extends Node {
    constructor(public if_branch: ConditionalNode, public elif_branch: ConditionalNode[], public else_branch?: ConditionalNode) {
        super(NodeType.Condition)
    }
}

export class CallSignatureNode extends Node {
    constructor(public callee: IdentifierNode, public args: Expression[]) {
        super(NodeType.CallSignature)
    }
}

export class CallStatement extends Node {
    constructor(public callExpr: CallSignatureNode) {
        super(NodeType.CallStatement)
    }
}

export type Expression = IdentifierNode | NumberNode | StringNode | BinaryOperatorNode;
export type StatementNode = ReturnStatementNode | BreakStatementNode | LoopNode | ConditionNode | CallStatement;