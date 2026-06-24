import { TokenType, type Token } from "../../tokens";
import { ImportNode, UsingNode } from "../ast";
import { ParseBinds } from "./binding";

export class ParseImports extends ParseBinds {


    parseImport() {

        let moduleSequence: string[] = []

        this.expect(this.peek(0) as Token, TokenType.K_Import, () => this.advance());

        this.expect(this.peek(0) as Token, TokenType.Identifier, () => {

            const _thisToken = this.peek(0) as Token

            moduleSequence.push(
                this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1)
            )

            this.advance()

        })

        while ((this.peek(0) as Token).tokenType == TokenType.Dot) {

            this.advance()

            this.expect(this.peek(0) as Token, TokenType.Identifier, () => {

                const _thisToken = this.peek(0) as Token

                moduleSequence.push(
                    this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1)
                )

                this.advance()

            })

        }

        this.expect(this.peek(0) as Token, TokenType.Semicolon, () => this.advance())
        return new ImportNode(moduleSequence)

    }

    parseUsing() {

        let moduleSequence: string[] = []

        this.expect(this.peek(0) as Token, TokenType.K_Using, () => this.advance());

        this.expect(this.peek(0) as Token, TokenType.Identifier, () => {

            const _thisToken = this.peek(0) as Token

            moduleSequence.push(
                this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1)
            )

            this.advance()

        })

        while ((this.peek(0) as Token).tokenType == TokenType.Dot) {

            this.advance()

            this.expect(this.peek(0) as Token, TokenType.Identifier, () => {

                const _thisToken = this.peek(0) as Token

                moduleSequence.push(
                    this.source.str.substring(_thisToken.span.startIndex, _thisToken.span.endIndex + 1)
                )

                this.advance()

            })

        }

        this.expect(this.peek(0) as Token, TokenType.Semicolon, () => this.advance())
        return new UsingNode(moduleSequence)

    }


}