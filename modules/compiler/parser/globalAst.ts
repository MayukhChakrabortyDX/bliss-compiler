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
    DataAndActionBasedArgument, Annotation,
    ViewStatement, HandlePointer, Pointer, Reference, ViewPointer,
    PointerExpressionNode, HandleExpressionNode, ReferenceExpressionNode,
    AddressOfOperator, ViewDeclNode, SizeOfOperator, MemberAccess, MemberAccessNode,
    ExpressionAsStatement, MagneticCallChain, AliasStatement, ViewExpression,
    PointerDeclNode, TransformStatement,TransformDeclNode
}

export class Node {

    typeName: string;
    start: number = 0;
    end: number = 0;

    constructor(public type: NodeType) {
        this.typeName = NodeType[type]
    }
}