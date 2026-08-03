//declare nodes based on rules
export enum NodeType {
    Program, FunctionDefinition, EmptyNode, CallList,
    ReturnStatement, Identifier,
    Number, BinaryOperation,
    Import, Using,
    String, Break,
    Loop, ConditionUnit,
    Condition, CallSignature,
    CallStatement, ScalarType, CompositeType,
    VariableDeclNode, AssignmentNode,
    DataNode, ActionNode, BindingNode,
    TypeBasedArgument, ActionBasedArgument,
    DataAndActionBasedArgument, Annotation,
    ViewStatement, HandlePointer, Pointer, Reference, ViewPointer,
    PointerExpressionNode, HandleExpressionNode, ReferenceExpressionNode,
    ViewDeclNode, MemberAccessNode,
    ExpressionAsStatement, MagneticCallChain, AliasStatement, ViewExpression,
    PointerDeclNode, TransformStatement,TransformDeclNode, UnaryOperation,
    DataFieldNode,
    Integer, DataType, TokenNode, BinaryRelation, ListOfNodes, Modifier, LetNode, TransformNode,
    Allocator, Module, Function, Body, If, Elif, Else
}

export class Node {

    typeName: string;
    start: number = 0;
    end: number = 0;

    constructor(public type: NodeType) {
        this.typeName = NodeType[type]
    }
}