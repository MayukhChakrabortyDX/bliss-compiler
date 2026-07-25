import { TokenType } from "../../tokenizer/tokens";
import { Node, NodeType } from "../../parser/globalAst";
import { ParseImports } from "./imports";

export class AnnotationNode extends Node {
    constructor(public name: string) {
        super(NodeType.Annotation)
    }
}

export class ParseAnnotation extends ParseImports {

    parseAnnotation() {

        const finish = this.start()
        this.shouldBe(TokenType.AtSymbol)
        return finish(new AnnotationNode(this.digest(TokenType.Identifier)))

    }

}