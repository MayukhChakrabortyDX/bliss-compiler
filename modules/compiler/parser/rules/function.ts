import { Token, TokenType } from "../../tokenizer/tokens";
import {
    ActionBasedArgument, ArgumentIdentifierNode, ArgumentTypes, DataAndActionBasedArgument,
    FunctionDefinitionNode, TypeBasedArgument,
    type ArgumentList, type StatementNode
} from "../ast";
import { ParseData } from "./data";

class ParseArguments extends ParseData {

    argumentNameStartSet = new Set([TokenType.HashSymbol, TokenType.LSquareBrace, TokenType.Backtick])

    //argument name is basically what kind of pointer we are accessing that's all.
    parseArgumentNameNode() {

        let identifierName: string = ""
        let argumentMode: ArgumentTypes = ArgumentTypes.PASS_BY_COPY;
        //Format - identifier, [identifier], #[identifier], `identifier
        if ((this.peek(0) as Token).tokenType == TokenType.Identifier) {

            identifierName = this.digest(TokenType.Identifier)

        } else {

            switch ((this.peek(0) as Token).tokenType) {

                case TokenType.LSquareBrace:
                    this.advance()
                    identifierName = this.digest(TokenType.Identifier)
                    this.shouldBe(TokenType.RSquareBrace)
                    argumentMode = ArgumentTypes.PASS_BY_UNSAFE_POINTER
                    break;

                case TokenType.HashSymbol:
                    this.advance()
                    this.shouldBe(TokenType.LSquareBrace)
                    identifierName = this.digest(TokenType.Identifier)
                    argumentMode = ArgumentTypes.PASS_BY_HANDLE_POINTER
                    this.shouldBe(TokenType.RSquareBrace)
                    break

                case TokenType.Backtick:
                    this.advance()
                    identifierName = this.digest(TokenType.Identifier)
                    argumentMode = ArgumentTypes.PASS_BY_REFERENCE
                    break;

                default:
                    throw Error(`Invalid Argument Modifier, ${this.getTokenTypeName((this.peek(0) as Token).tokenType)}`)
            }

        }

        return new ArgumentIdentifierNode(identifierName, argumentMode)

    }

    parseTypeBasedArgument() {

        const typeNode = this.parseType()
        const scalarIdentifier = this.parseArgumentNameNode()

        return new TypeBasedArgument(typeNode, scalarIdentifier)

    }

    //this is where we come up with the 'with' keyword
    parseActionBasedArgument() {

        const argumentName = this.parseArgumentNameNode()
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

        const dataName = this.parseType()
        const argumentName = this.parseArgumentNameNode()
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

        if (this.argumentNameStartSet.has((this.peek(0) as Token).tokenType)) {

            if (this.expectTill(4, TokenType.K_With))
                return this.parseActionBasedArgument()

        }

        if (this.argumentNameStartSet.has((this.peek(1) as Token).tokenType)) {

            if (this.expectTill(5, TokenType.K_With))
                //it's guaranteed to be simple action
                return this.parseDataAndActionArgument()

        }

        if ((this.peek(2) as Token).tokenType == TokenType.K_With) {
            return this.parseDataAndActionArgument()
        }

        if ((this.peek(1) as Token).tokenType == TokenType.K_With) {
            return this.parseActionBasedArgument()
        }

        return this.parseTypeBasedArgument()

    }
}

export class ParseFunction extends ParseArguments {

    //parses the function head and can be used with definitions as well.
    parseFunctionHead() {

        this.shouldBe(TokenType.K_Fx);

        let name: string = this.digest(TokenType.Identifier);

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

        //body to be worked out.
        return new FunctionDefinitionNode(name, returnType, argumentList)
    }

    parseFunctionDefinition() {

        const head = this.parseFunctionHead(); head.body = []
        this.shouldBe(TokenType.LBracket)

        //we consume the statements
        while (this.statementSet.has((this.peek(0) as Token).tokenType)) {
            head.body.push(this.parseStatement())
        }

        this.shouldBe(TokenType.RBracket)

        return head

    }

    parseReducedFunction() {

        const parseHead = this.parseFunctionHead()
        this.shouldBe(TokenType.Semicolon)

        return parseHead
    }

}