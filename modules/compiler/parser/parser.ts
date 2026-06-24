import {
    FunctionDefinitionNode,
    ProgramNode,
    type ImportNode, type DataNode,
    ActionNode,
    BindingNode,
} from "./ast";

import { Token, TokenType } from "../tokens";
import { log, Log } from "../../logger";
import { ParseImports } from "./rules/imports";

export class Parser extends ParseImports {


    programSet = new Set([TokenType.K_Fx, TokenType.K_Data, TokenType.K_Action, TokenType.K_Bind])
    parseProgram() {

        const importList: ImportNode[] = [];
        const body: (FunctionDefinitionNode | DataNode | ActionNode | BindingNode)[] = []

        while ((this.peek(0) as Token).tokenType == TokenType.K_Import || (this.peek(0) as Token).tokenType == TokenType.K_Using) {
            importList.push(
                (this.peek(0) as Token).tokenType == TokenType.K_Import ? this.parseImport() : this.parseUsing()
            );
        }

        while (this.programSet.has((this.peek(0) as Token).tokenType)) {
            switch ((this.peek(0) as Token).tokenType) {
                case TokenType.K_Fx:
                    body.push(this.parseFunctionDefinition())
                    break
                case TokenType.K_Data:
                    body.push(this.parseData())
                    break
                case TokenType.K_Action:
                    body.push(this.parseAction())
                    break
                case TokenType.K_Bind:
                    body.push(this.parseBinding())
                    break
            }
            //console.log( this.source.str.substring( this.peek(0)?.span.startIndex, this.peek(0)?.span.endIndex + 1 ) )
        }

        if (this.peek(0)?.tokenType != TokenType.EOF) {
            log(Log.Error, "PARSER", "Unexpected Token", `Unexpected token ${this.peek(0)?.tokenType}. Expected token type ${TokenType.EOF} instead`)
            process.exit(1)

        }

        return new ProgramNode(body, importList);

    }

}