import type { StringContainer, StringSpan } from "../tokenizer/tokens"

//declare nodes based on rules
export enum NodeType {
    Program, FunctionDefinition, 
    ReturnStatement, Identifier, 
    Number, BinaryOperationExpression, 
    Import, Using, 
    String, Break, 
    Loop, ConditionUnit, 
    Condition, CallSignature,
    CallStatement, ScalarType, CompositeType,
    VariableDeclNode, AssignmentNode,
    DataNode, ActionNode, BindingNode,
    TypeBasedArgument, ActionBasedArgument,
    DataAndActionBasedArgument
}

export class Node {

    typeName: string;
    
    constructor(public type: NodeType) {
        this.typeName = NodeType[type]
    }
}

export class FunctionDefinitionNode extends Node {
    constructor(public name: string, public returnType: TypeNode, public argumentList: ArgumentList[], public body?: StatementNode[]) {
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

    constructor(public body: (FunctionDefinitionNode | DataNode | ActionNode | BindingNode)[], public importList: ImportNode[]) {
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

export class ScalarTypeNode extends Node {
    constructor( public type_name: string ) {
        super( NodeType.ScalarType )
    }
}

export class CompositeTypeNode extends Node {
    constructor(public dataName: string, public attachedBindings: string[]) {
        super( NodeType.CompositeType )
    }
}

export type TypeNode = ScalarTypeNode | CompositeTypeNode

export class VariableDeclNode extends Node {
    constructor(public name: string, public type_of_variable: TypeNode, public expression: Expression, public isUnsafe: boolean = false) {
        super( NodeType.VariableDeclNode )
    }
}

export class AssignmentNode extends Node {
    constructor(public name: string, public expression: Expression) {
        super( NodeType.AssignmentNode )
    }
}

export class DataStructNode extends Node {
    constructor(public name: string, public fields: DataStructField[]) {
        super( NodeType.DataNode )
    }
}

export class DataStructField {
    constructor( public name: string, public type: TypeNode ) {}
}

export class DataSoloNode extends Node {
    constructor( public name: string ) {
        super( NodeType.DataNode )
    }
}

export class DataScalarNode extends Node {
    constructor( public name: string, public dataType: TypeNode ) {
        super(NodeType.DataNode);
    }
}

export class DataArrayNode extends Node {
    constructor( public name: string, public dataType: TypeNode, public size: NumberNode ) {
        super(NodeType.DataNode);
    }
}

export class ActionNode extends Node {
    constructor( public name: string, public functions: FunctionDefinitionNode[] ) {
        super(NodeType.ActionNode)
    }
}

export class BindingNode extends Node {
    constructor(public dataName: string, public bindingName: string, public actionNames: string[], public functionDefinitions: FunctionDefinitionNode[]) {
        super(NodeType.BindingNode)
    }
}

export class TypeBasedArgument extends Node {
    constructor(public typeInfo: TypeNode, public argumentName: string) {
        super(NodeType.TypeBasedArgument)
    }
}

export class ActionBasedArgument extends Node {
    //names of action with the argument present.
    constructor(public argumentName: string, public actionList: string[]) {
        super(NodeType.ActionBasedArgument)
    }
}

export class DataAndActionBasedArgument extends Node {
    //note - this is strictly data
    constructor(public argumentName: string, public actionList: string[], public dataName: string) {
        super(NodeType.DataAndActionBasedArgument)
    }
}

export type ArgumentList = TypeBasedArgument | ActionBasedArgument | DataAndActionBasedArgument;
export type DataNode = DataSoloNode | DataStructNode | DataScalarNode | DataArrayNode;

export type Expression = IdentifierNode | NumberNode | StringNode | BinaryOperatorNode | CallSignatureNode | null;
export type StatementNode = ReturnStatementNode | BreakStatementNode | LoopNode | ConditionNode | CallStatement;