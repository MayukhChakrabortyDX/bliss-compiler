import { Token, TokenType } from "../../tokenizer/tokens";
import {
    ActionBasedArgument, DataAndActionBasedArgument,
    FunctionDefinitionNode, TypeBasedArgument,
    type ArgumentList, type StatementNode,
    type TypeNode
} from "../ast";
import { ParseData } from "./data";

class ParseArguments extends ParseData {
    parseTypeBasedArgument(type: TypeNode, name: string) {

        return new TypeBasedArgument(type, name);

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

    parseDataAndActionArgument(dataName: TypeNode, argumentName: string) {

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

        //this is the grammar for action (guaranteed.)
        if ((this.peek(0) as Token).tokenType == TokenType.Identifier && (this.peek(1) as Token).tokenType == TokenType.K_With) {
            return this.parseActionBasedArgument()
        }
    
        //now the actual stuff - the branch between the data and scalar portion.
        let type = this.parseType(); //get the type
        let identifier = this.digest(TokenType.Identifier)
        let node: ArgumentList;

        this.maybeExpect(this.peek(0) as Token, TokenType.K_With, () => {

            //this is the data and action portion
            node = this.parseDataAndActionArgument(type, identifier)
            

        }, () => {
            //this is the simple argument portion
            node = this.parseTypeBasedArgument(type, identifier)

        })

        //@ts-ignore
        return (node as ArgumentList)

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