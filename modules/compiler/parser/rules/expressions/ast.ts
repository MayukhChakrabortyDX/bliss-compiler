import { NodeType, Node } from "../../globalAst"
import { StringSpan } from "../../../tokenizer/tokens"
import { IdentifierNode, ExpressionAsStatement } from "../statements"

export class StringNode extends Node {
    constructor(public span: StringSpan) {
        super(NodeType.String)
    }
}

export enum Number {
    Real, Integer
}

export class NumberNode extends Node {

    constructor(public value: string, public subtypes: Number.Real | Number.Integer) {
        super(NodeType.Number)
    }

}

export class PointerExpressionNode extends Node {

    constructor(public expression: Expression, public offset?: Expression) {
        super(NodeType.PointerExpressionNode)
    }

}

export class ReferenceExpressionNode extends Node {

    constructor(public expression: Expression) {
        super(NodeType.ReferenceExpressionNode)
    }

}

export class ViewExpression extends Node {
    constructor(public expression: Expression) {
        super(NodeType.ViewExpression)
    }
}

export class HandlExpressionNode extends Node {

    constructor(public expression: Expression, public offset?: Expression) {
        super(NodeType.HandleExpressionNode)
    }

}

export class CallSignatureNode extends Node {
    constructor(public callee: IdentifierNode, public args: Expression[]) {
        super(NodeType.CallSignature)
    }
}

export class CallSignature extends Node {
    constructor(public args: Expression[]) {
        super(NodeType.CallSignature)
    }
}

export enum BinaryOperation {
    //arithmetic
    Multiply, Divide, Add, Subtract,
    //expresion based
    GreaterThan, LessThan, GreaterThanEqual, LessThanEqual, Assignment,
    Equals, NotEquals,

    MagneticCall, MemberAccess, BindingAccess, CallSignature
}

export enum UnaryOperation {
    AddressOf, SizeOf
}

export class BinaryOperatorNode extends Node {
    constructor(public left: Expression, public right: Expression, public operator: BinaryOperation) {
        super(NodeType.BinaryOperationExpression)
    }

    toJSON() {
        return {
            ...this, operatorName: BinaryOperation[ this.operator ]
        }
    }

}

export class UnaryOperatorNode extends Node {
    constructor(public expression: Expression, public operator: UnaryOperation) {
        super(NodeType.UnaryOperation)
    }
}

export type Expression = CallSignature |
    ViewExpression | ExpressionAsStatement |
    UnaryOperatorNode | IdentifierNode |
    NumberNode | PointerExpressionNode |
    HandlExpressionNode | ReferenceExpressionNode |
    StringNode | BinaryOperatorNode |
    CallSignatureNode | null;
