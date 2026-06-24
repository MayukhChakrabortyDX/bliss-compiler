import { Token, TokenType } from "../../tokens";
import {
    ActionBasedArgument, DataAndActionBasedArgument,
    FunctionDefinitionNode, TypeBasedArgument,
    type ArgumentList, type StatementNode
} from "../ast";
import { ParseData } from "./data";

export class ParseFunction extends ParseData {

    parseTypeBasedArgument() {

        const typeNode = this.parseType()
        const scalarIdentifier = this.digest(TokenType.Identifier)

        return new TypeBasedArgument(typeNode, scalarIdentifier)

    }

    //this is where we come up with the 'with' keyword
    parseActionBasedArgument() {

        const argumentName = this.digest(TokenType.Identifier)
        this.shouldBe(TokenType.K_With)

        const actionList: string[] = []

        if ((this.peek(0)?.tokenType) == TokenType.LBrace) {

            this.advance()
            //here we produce!
            //atleast one is required
            actionList.push(this.digest(TokenType.Identifier))

            while ((this.peek(0) as Token).tokenType != TokenType.RBrace) {

                this.shouldBe(TokenType.Comma)
                actionList.push(this.digest(TokenType.Identifier))

            }

            this.shouldBe(TokenType.RBrace)
            return new ActionBasedArgument(argumentName, actionList)
        }

        //otherwise
        actionList.push(
            this.digest(TokenType.Identifier)
        )

        return new ActionBasedArgument(argumentName, actionList)

    }

    parseDataAndActionArgument() {
        const dataName = this.digest(TokenType.Identifier)
        const argumentName = this.digest(TokenType.Identifier)
        this.shouldBe(TokenType.K_With)

        const actionList: string[] = []

        if ((this.peek(0)?.tokenType) == TokenType.LBrace) {

            this.advance()
            //here we produce!
            //atleast one is required
            actionList.push(this.digest(TokenType.Identifier))

            while ((this.peek(0) as Token).tokenType != TokenType.RBrace) {

                this.shouldBe(TokenType.Comma)
                actionList.push(this.digest(TokenType.Identifier))

            }

            this.shouldBe(TokenType.RBrace)
            return new DataAndActionBasedArgument(argumentName, actionList, dataName)
        }

        //otherwise
        actionList.push(
            this.digest(TokenType.Identifier)
        )


        return new DataAndActionBasedArgument(argumentName, actionList, dataName)
    }

    parseArgument() {

        //connecting function

        if ((this.peek(2) as Token).tokenType == TokenType.K_With) {
            return this.parseDataAndActionArgument()
        }

        if ((this.peek(1) as Token).tokenType == TokenType.K_With) {
            return this.parseActionBasedArgument()
        }

        return this.parseTypeBasedArgument()

    }

    parseFunctionDefinition() {

        let name: string = "";
        let body: StatementNode[] = []

        this.advance() // from the fx token ofc

        const firstToken = this.peek(0)
        //@ts-ignore
        this.expect(firstToken, TokenType.Identifier, () => {
            //@ts-ignore
            name = this.source.str.substring(firstToken?.span.startIndex, firstToken?.span.endIndex + 1);
        })

        this.advance();

        const secondToken = this.peek(0)
        //@ts-ignore
        this.expect(secondToken, TokenType.LBrace, () => this.advance())

        //we now assume the list of arguments
        const argumentList: ArgumentList[] = []

        if ((this.peek(0) as Token).tokenType != TokenType.RBrace) {
            //if the end has not reached yet
            argumentList.push(this.parseArgument())
        }

        while ((this.peek(0) as Token).tokenType != TokenType.RBrace) {

            this.shouldBe(TokenType.Comma)
            //unless we hit the boundary
            argumentList.push(this.parseArgument())

        }

        const thirdToken = this.peek(0)
        //@ts-ignore
        this.expect(thirdToken, TokenType.RBrace, () => this.advance())

        this.expect(this.peek(0) as Token, TokenType.Colon, () => this.advance())

        //expect a type
        let returnType = this.parseType()

        const forthToken = this.peek(0)
        //@ts-ignore
        this.expect(forthToken, TokenType.LBracket, () => this.advance())

        //we consume the statements
        while (this.statementSet.has((this.peek(0) as Token).tokenType)) {
            //@ts-ignore
            body.push(this.parseStatement())
        }

        const fifthToken = this.peek(0)
        //@ts-ignore
        this.expect(fifthToken, TokenType.RBracket, () => this.advance())

        return new FunctionDefinitionNode(name, returnType, argumentList, body)

    }

    parseReducedFunction() {

        let name: string = "";

        this.advance() // from the fx token ofc

        const firstToken = this.peek(0)
        //@ts-ignore
        this.expect(firstToken, TokenType.Identifier, () => {
            //@ts-ignore
            name = this.source.str.substring(firstToken?.span.startIndex, firstToken?.span.endIndex + 1);
        })

        this.advance();


        this.shouldBe(TokenType.LBrace)

        const argumentList: ArgumentList[] = []

        if ((this.peek(0) as Token).tokenType != TokenType.RBrace) {
            //if the end has not reached yet
            argumentList.push(this.parseArgument())
        }

        while ((this.peek(0) as Token).tokenType != TokenType.RBrace) {

            this.shouldBe(TokenType.Comma)
            //unless we hit the boundary
            argumentList.push(this.parseArgument())

        }

        this.shouldBe(TokenType.RBrace)
        this.shouldBe(TokenType.Colon)

        //expect a type
        let returnType = this.parseType()

        this.shouldBe(TokenType.Semicolon)

        return new FunctionDefinitionNode(name, returnType, argumentList)
    }

}