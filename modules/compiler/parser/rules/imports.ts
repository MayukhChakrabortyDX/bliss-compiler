import { TokenType, type Token } from "../../tokenizer/tokens";
import { Node, NodeType } from "../globalAst";
import { ParseBinds } from "./binding";

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

export class ParseImports extends ParseBinds {

    parseImportSequence() {
        
        let moduleSequence: string[] = []

        moduleSequence.push(
            this.digest(TokenType.Identifier)
        )

        while ((this.peek(0) as Token).tokenType == TokenType.Dot) {

            this.advance()

            moduleSequence.push(
                this.digest(TokenType.Identifier)
            )

        }

        this.shouldBe(TokenType.Semicolon)
        return moduleSequence

    }

    parseImport() {

        this.shouldBe(TokenType.K_Import)
        return new ImportNode(this.parseImportSequence())

    }

    parseUsing() {

        this.shouldBe(TokenType.K_Using)
        return new UsingNode(this.parseImportSequence())

    }


}