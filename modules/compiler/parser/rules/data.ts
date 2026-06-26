import { Token, TokenType } from "../../tokenizer/tokens";
import {
    DataArrayNode, DataScalarNode,
    DataSoloNode, DataStructField,
    DataStructNode, Number, NumberNode
} from "../ast";
import { ParseStatement } from "./statements";

export class ParseData extends ParseStatement {

    parseDataStructField() {

        const typeNode = this.parseType();
        let variableName: string = this.digest(TokenType.Identifier)

        this.shouldBe(TokenType.Semicolon)

        return new DataStructField(variableName, typeNode)

    }

    parseDataStructDecl() {

        const fields: DataStructField[] = []
        this.shouldBe(TokenType.K_Data)
        let variableName: string = this.digest(TokenType.Identifier)

        this.shouldBe(TokenType.LBracket)

        fields.push(
            this.parseDataStructField()
        )

        while ((this.peek(0) as Token).tokenType != TokenType.RBracket) {
            fields.push(
                this.parseDataStructField()
            )
        }

        this.shouldBe(TokenType.RBracket)

        return new DataStructNode(variableName, fields)
    }

    parseDataScalarNodeDecl() {
        this.shouldBe(TokenType.K_Data)
        let variableName: string = this.digest(TokenType.Identifier)

        this.shouldBe(TokenType.LBrace)
        let typeNode = this.parseType()
        this.shouldBe(TokenType.RBrace)
        this.shouldBe(TokenType.Semicolon)

        return new DataScalarNode(variableName, typeNode)
    }

    parseDataSoloDecl() {

        this.shouldBe(TokenType.K_Data)
        let variableName: string = this.digest(TokenType.Identifier)

        this.shouldBe(TokenType.Semicolon)

        return new DataSoloNode(variableName)

    }

    parseDataArrayDecl() {
        this.shouldBe(TokenType.K_Data)
        let variableName: string = this.digest(TokenType.Identifier)

        this.shouldBe(TokenType.LSquareBrace)

        let typeNode = this.parseType()
        this.shouldBe(TokenType.Comma)

        let number: string = this.digest(TokenType.Integer)

        this.shouldBe(TokenType.RSquareBrace)
        this.shouldBe(TokenType.Semicolon)

        return new DataArrayNode(variableName, typeNode, new NumberNode(number, Number.Integer))
    }

    parseData() {

        const _token = (this.peek(2) as Token).tokenType
        if (_token == TokenType.Semicolon) {
            //this is what we will handle right now
            return this.parseDataSoloDecl()

        } else if (_token == TokenType.LSquareBrace) {
            return this.parseDataArrayDecl()
        }

        else if (_token == TokenType.LBrace) {
            return this.parseDataScalarNodeDecl()
        }

        else {
            return this.parseDataStructDecl()
        }

    }

}