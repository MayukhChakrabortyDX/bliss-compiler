//imports token types and creates tokens from an input string

import { Log, log } from "../logger";
import { StringContainer, StringSpan, Token, TokenType } from "./tokens";
import 'bun'

export class Tokenizer {

    keywords: Map<string, TokenType> = new Map([

        ["data", TokenType.K_Data],
        ["if", TokenType.K_If],
        ["action", TokenType.K_Action],
        ["bind", TokenType.K_Bind],
        ["fx", TokenType.K_Fx],
        ["import", TokenType.K_Import],
        ["using", TokenType.K_Using],
        ["view", TokenType.K_View],
        ["let", TokenType.K_Let],
        ["as", TokenType.K_As],
        ["return", TokenType.K_Return],
        ["ptr", TokenType.K_Ptr],
        ["set", TokenType.K_Set],
        ["get", TokenType.K_Get],
        ["cset", TokenType.K_CSet],
        ["cget", TokenType.K_CGet],
        ["else", TokenType.K_Else],
        ["elif", TokenType.K_Elif],
        ["loop", TokenType.K_Loop],
        ["break", TokenType.K_Break],
        ["continue", TokenType.K_Continue],
        ["with", TokenType.K_With],
        ["alias", TokenType.K_Alias]
        
    ])

    sourceContainer: StringContainer
    constructor(public source: string) {
        //this is because strings are copied, we need to store a live reference instead.
        this.sourceContainer = new StringContainer(source)
    }

    //given a start span that starts the string itself
    processString(start: number) {

        let endSpan = start;
        //the task: return a final span value basically.
        //we have to handle escapes as well.
        enum StringState {
            Consume, Escape
        }

        let localState: StringState = StringState.Consume;

        while (true) {

            let char = this.source.charAt(endSpan)

            if (char == "") return endSpan
            //we only care about special characters
            if (char == '\n') {
                log(Log.Error, "LEXER", `String cannot contain newline characters`, `The source code has a string at [][] that has a newline which is not allowed`)
                process.exit(1)
            }

            if (char == "\\") {

                if (localState == StringState.Consume) {
                    localState = StringState.Escape
                    endSpan++;
                    continue;
                } else {
                    localState = StringState.Consume;
                    endSpan++;
                    continue;
                }

            }

            if (char == '"') {

                if (localState == StringState.Consume) {

                    return endSpan //we are done

                } else {

                    endSpan++;
                    localState = StringState.Consume;
                    continue;

                }

            }

            if (localState == StringState.Escape) {
                localState = StringState.Consume
            }

            endSpan++

        }

    }

    tokenize() {

        const tokens: Token[] = []

        //no buffers, we are going to work with spans
        let row = 0; let col = 0; let span_start = 0; let span_end = 0;
        let presentState: TokenType = TokenType.ScanningState;

        const ignore = () => {
            if (presentState != TokenType.ScanningState) {
                emitAndAdvance()
            }
            else {
                advance()
            }
        }

        const jump = () => {
            span_start = span_end;
        }

        const advance = () => {
            span_end++; span_start = span_end;
        }
        const emitAndAdvance = () => {

            emit()
            advance()
        }

        const peek = () => {
            if (span_end + 1 < this.source.length) {
                return this.source.charAt(span_end + 1)
            } else {
                return null
            }
        }

        const emit = () => {
            let endIndex = (span_end - span_start == 0) ? span_end : span_end - 1
            //since identifier can also be keywords
            if (presentState == TokenType.Identifier) {
                const comparable = this.source.substring(span_start, span_end)
                if (this.keywords.has(comparable)) {
                    tokens.push(new Token((this.keywords.get(comparable) as TokenType), new StringSpan(span_start, endIndex, this.sourceContainer), row, col))
                } else {
                    tokens.push(new Token(presentState, new StringSpan(span_start, endIndex, this.sourceContainer), row, col))
                }
            } else if ( presentState == TokenType.String ) {
                tokens.push(new Token(presentState, new StringSpan(span_start + 1, endIndex - 1, this.sourceContainer), row, col))
            }
            
            else {
                tokens.push(new Token(presentState, new StringSpan(span_start, endIndex, this.sourceContainer), row, col))
            }

            presentState = TokenType.ScanningState
        }

        const pureEmit = () => {

            if (presentState == TokenType.Identifier) {
                const comparable = this.source.substring(span_start, span_end)
                if (this.keywords.has(comparable)) {
                    tokens.push(new Token((this.keywords.get(comparable) as TokenType), new StringSpan(span_start, span_end, this.sourceContainer), row, col))
                } else {
                    tokens.push(new Token(presentState, new StringSpan(span_start, span_end, this.sourceContainer), row, col))
                }
            } 
            
            else if ( presentState == TokenType.String ) {
                tokens.push(new Token(presentState, new StringSpan(span_start + 1, span_end - 1, this.sourceContainer), row, col))
            } 
            
            else {
                tokens.push(new Token(presentState, new StringSpan(span_start, span_end, this.sourceContainer), row, col))
            }

            presentState = TokenType.ScanningState
        }

        //used to emit characters that are standalone
        const soloCharacter = (token: TokenType) => {

            if (presentState == TokenType.ScanningState) {
                presentState = token;
                emitAndAdvance()
            } else {
                emit()
                jump()
                presentState = token;
                emitAndAdvance()
            }

        }

        const doubleCharacter = (base: TokenType, extends_to: TokenType, check: string) => {
            const next = peek()
            if (next == check) {

                if (presentState == TokenType.ScanningState) {
                    presentState = extends_to
                    jump(); span_end++;
                    pureEmit(); advance()
                } else {
                    emit(); jump()
                    presentState = extends_to;
                    span_end++
                    pureEmit(); advance()
                }

            } else {
                soloCharacter(base)
            }
        }

        while (true) {

            if (span_end >= this.source.length) {

                if (span_end == span_start) break;
                if (span_end > span_start) {
                    //this means some sort of scanning was being done
                    emitAndAdvance(); //this emitAndAdvance logic needs revisiting
                    break;
                }

            }

            //case of whitespace, we simply ignore it (it's our delimiter)
            switch (this.source.charAt(span_end)) {

                case " ":
                case "\r":
                case "\n":
                case "\t":
                    ignore();
                    break;

                default:
                    //for some other case
                    //detect lowercase or uppercase english characters
                    const char = this.source.charAt(span_end);
                    const codePoint = char.charCodeAt(0);

                    if ((65 <= codePoint && codePoint <= 90) || (97 <= codePoint && codePoint <= 122)) {

                        //this is a english character.
                        //possbile cases - scanning was already being done, and we are adding a new scan.
                        //there is no rule so far that tells us that english characters can be appended. So we emitAndAdvance

                        if (presentState == TokenType.ScanningState) {

                            //morph
                            presentState = TokenType.Identifier
                            jump();

                        } else if (presentState == TokenType.Identifier) {

                            span_end++; //keep on scanning

                        } else {

                            //there is no rule specifying idendifier appending
                            emitAndAdvance()
                            //and continue
                            presentState = TokenType.Identifier
                            advance();

                        }

                        continue;

                    }

                    if (48 <= codePoint && codePoint <= 57) {

                        //the rules dictate there are several possibilities.
                        //For example, we can append numbers to decimal values, simple numerics, and characters.
                        //it's better to handle each case specifically
                        if (presentState == TokenType.ScanningState) {

                            //we morph it to integer
                            presentState = TokenType.Integer;
                            span_end++; //keep scanning

                        } else if (presentState == TokenType.Identifier) {

                            span_end++; //we simply append it

                        } else if (presentState == TokenType.Integer) {

                            span_end++; //same here

                        } else if (presentState == TokenType.RealNumber) {

                            span_end++;

                        } else {

                            //there is no rule dictating append rule for number, so we simply emitAndAdvance and restart
                            emitAndAdvance()
                            presentState = TokenType.Integer;

                        }

                        continue;

                    }

                    //we now handle symbols. Let's start with the dot symbol.
                    //Rules dictate that the dot symbol now can be part of dot operator where it's explicit
                    //or can be combined with an integer to form real number

                    if (char == '.') {

                        //we append only to integers
                        if (presentState == TokenType.Integer) {
                            //change it
                            presentState = TokenType.RealNumber;
                            span_end++;

                        } else if (presentState == TokenType.RealNumber) {

                            throw Error("Real number cannot have multiple decimal points")
                            //this is an error. You cannot have multiple points on a real number

                        } else if (presentState == TokenType.ScanningState) {

                            presentState = TokenType.Dot
                            //so far, it's standalone
                            emitAndAdvance()

                        } else {

                            //we emitAndAdvance.
                            emit()
                            jump()
                            presentState = TokenType.Dot
                            //dot is also standalone
                            emitAndAdvance()

                        }

                        continue;

                    }

                    if (char == '(') {
                        soloCharacter(TokenType.LBrace)
                        continue;
                    }

                    if (char == ')') {
                        soloCharacter(TokenType.RBrace)
                        continue;
                    }

                    if (char == '[') {
                        soloCharacter(TokenType.LSquareBrace)
                        continue;
                    }

                    if (char == ']') {
                        soloCharacter(TokenType.RSquareBrace)
                        continue;
                    }

                    if (char == '{') {
                        soloCharacter(TokenType.LBracket)
                        continue;
                    }

                    if (char == '}') {
                        soloCharacter(TokenType.RBracket)
                        continue;
                    }

                    if (char == ',') {
                        soloCharacter(TokenType.Comma)
                        continue;
                    }

                    if (char == ';') {
                        soloCharacter(TokenType.Semicolon)
                        continue;
                    }

                    if ( char == "*" ) {
                        soloCharacter(TokenType.Multiply)
                        continue;
                    }

                    //we will add nuances when adding comments
                    if ( char == "/" ) {
                        soloCharacter(TokenType.Divide)
                        continue;
                    }

                    if (char == ':') {
                        soloCharacter(TokenType.Colon)
                        continue;
                    }

                    if (char == '-') {
                        const next = peek()
                        if (next == ">") {

                            if (presentState == TokenType.ScanningState) {
                                presentState = TokenType.ArrowRight;
                                jump(); span_end++

                                pureEmit(); advance()
                            } else {
                                emit()
                                jump()
                                presentState = TokenType.ArrowRight;
                                span_end++

                                pureEmit(); advance()
                            }

                        } else if (next == "-") {
                            if (presentState == TokenType.ScanningState) {
                                presentState = TokenType.Decrement;
                                jump(); span_end++

                                pureEmit(); advance()
                            } else {
                                emit()
                                jump()
                                presentState = TokenType.Decrement;
                                span_end++

                                pureEmit(); advance()
                            }
                        } else {
                            soloCharacter(TokenType.Minus)
                        }

                        continue;
                    }

                    if ( char == "!" ) {
                        doubleCharacter(TokenType.Negation, TokenType.NotEqual, "=")
                        continue
                    }

                    if ( char == "<" ) {
                        doubleCharacter(TokenType.LessThan, TokenType.LessThanEqual, "=")
                        continue
                    }

                    if (char == ">") {
                        doubleCharacter(TokenType.GreaterThan, TokenType.GreaterThanEqual, "=")
                        continue
                    }

                    if (char == '+') {
                        doubleCharacter(TokenType.Add, TokenType.Increment, "+")
                        continue;
                    }

                    if (char == '=') {

                        doubleCharacter(TokenType.Assignment, TokenType.Compare, "=")
                        continue

                    }

                    if (char == '"') {

                        if (presentState == TokenType.ScanningState) {

                            jump();
                            span_end = this.processString(span_end + 1);
                            presentState = TokenType.String;
                            pureEmit(); advance()

                        } else {

                            emit(); jump();
                            span_end = this.processString(span_end + 1);
                            presentState = TokenType.String;
                            pureEmit(); advance()

                        }

                        continue

                    }

                    throw Error(`Error: Unrecognized Character "${char.codePointAt(0)}"`)

            }

        }

        //add the final EOF token
        tokens.push(new Token(TokenType.EOF, new StringSpan(this.source.length, this.source.length, this.sourceContainer), row, col))
        return tokens

    }

}