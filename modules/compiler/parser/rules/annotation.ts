import { TokenType } from "../../tokenizer/tokens";
import { AnnotationNode } from "../ast";
import { ParseImports } from "./imports";

export class ParseAnnotation extends ParseImports {

    parseAnnotation() {

        this.shouldBe(TokenType.AtSymbol)
        return new AnnotationNode(this.digest(TokenType.Identifier))

    }

}