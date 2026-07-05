import { TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import { ParseImports } from "./imports";

export class AnnotationNode extends Node {
    constructor(public name: string) {
        super(NodeType.Annotation)
    }
}

export class ParseAnnotation extends ParseImports {

    parseAnnotation() {

        this.shouldBe(TokenType.AtSymbol)
        return new AnnotationNode(this.digest(TokenType.Identifier))

    }

}