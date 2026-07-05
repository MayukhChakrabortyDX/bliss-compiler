import { NodeType, Node } from "../../globalAst"
import { StringSpan } from "../../../tokenizer/tokens"
import { IdentifierNode, ExpressionAsStatement } from "../statements"

export class StringNode extends Node {
    constructor( public span: StringSpan) {
        super(NodeType.String)
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

export class PointerExpressionNode extends Node {

    constructor(public expression: Expression, public offset?: Expression) {
        super(NodeType.PointerExpressionNode)
    }

}

export class ReferenceExpressionNode extends Node {

    constructor( public expression: Expression ) {
        super(NodeType.ReferenceExpressionNode)
    }

}

export class SizeOfOperator extends Node {

    constructor(public expression: Expression) {
        super(NodeType.SizeOfOperator)
    }

}

export class MemberAccess extends Node {

    constructor(public root: Expression, public accessing: Expression) {
        super(NodeType.MemberAccess)
    }

}

export class MagneticCallChain extends Node {
    constructor(public argument: Expression, public callee: Expression) {
        super(NodeType.MagneticCallChain)
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

export class AddressOfOperator extends Node {

    constructor( public expression: Expression ) {
        super(NodeType.AddressOfOperator)
    }

}

export enum BinaryOperation {
    Multiply, Divide, Add, Subtract,
    GreaterThan, LessThan, GreaterThanEqual, LessThanEqual, Assignment,
    Equals, NotEquals
}

export class BinaryOperatorNode extends Node {
    constructor( public left: Expression, public right: Expression, public operator: BinaryOperation ) {
        super(NodeType.BinaryOperationExpression)
    }

}

export type Expression = ViewExpression | MagneticCallChain | MemberAccess | ExpressionAsStatement | AddressOfOperator | SizeOfOperator | IdentifierNode | NumberNode| PointerExpressionNode | HandlExpressionNode | ReferenceExpressionNode | StringNode | BinaryOperatorNode | CallSignatureNode | null;
