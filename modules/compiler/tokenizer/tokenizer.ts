//imports token types and creates tokens from an input string

import { ProcessStringToken } from "./string";
import { StringContainer, StringSpan, Token, TokenType } from "./tokens";
import 'bun'

export class Tokenizer extends ProcessStringToken {

    constructor(source: string) {
        super(new StringContainer(source), source)
        this.source = this.source.replace(/\r/g, "")
        this.sourceContainer.str = this.source  // keep them in sync
    }

    soloCharacter(token: TokenType) {

        if (this.presentState == TokenType.ScanningState) {
            this.presentState = token;
            this.emitAndAdvance()
        } else {
            this.emit()
            this.jump()
            this.presentState = token;
            this.emitAndAdvance()
        }

    }

    doubleCharacter(base: TokenType, extends_to: TokenType, check: string) {
        const next = this.peek()
        if (next == check) {

            if (this.presentState == TokenType.ScanningState) {
                this.presentState = extends_to
                this.jump(); this.span_end++;
                this.pureEmit(); this.advance()
            } else {
                this.emit(); this.jump()
                this.presentState = extends_to;
                this.span_end++
                this.pureEmit(); this.advance()
            }

        } else {
            this.soloCharacter(base)
        }
    }

    //given a start span that starts the string itself

    tokenize() {

        //used to this.emit characters that are standalone

        while (true) {

            if (this.span_end >= this.source.length) {

                if (this.span_end == this.span_start) break;
                if (this.span_end > this.span_start) {
                    //this means some sort of scanning was being done
                    this.emitAndAdvance(); //this this.emitAndAdvance logic needs revisiting
                    break;
                }

            }

            //case of whitespace, we simply this.ignore it (it's our delimiter)
            switch (this.source.charAt(this.span_end)) {

                case " ":
                case "\r":
                case "\n":
                case "\t":
                    this.ignore();
                    break;

                default:
                    //for some other case
                    //detect lowercase or uppercase english characters
                    const char = this.source.charAt(this.span_end);
                    const codePoint = char.charCodeAt(0);

                    if ((65 <= codePoint && codePoint <= 90) || (97 <= codePoint && codePoint <= 122)) {

                        //this is a english character.
                        //possbile cases - scanning was already being done, and we are adding a new scan.
                        //there is no rule so far that tells us that english characters can be appended. So we this.emitAndAdvance

                        if (this.presentState == TokenType.ScanningState) {

                            //morph
                            this.presentState = TokenType.Identifier
                            this.jump();

                        } else if (this.presentState == TokenType.Identifier) {

                            this.span_end++; //keep on scanning

                        } else {

                            //there is no rule specifying idendifier appending
                            this.emitAndAdvance()
                            //and continue
                            this.presentState = TokenType.Identifier
                            this.advance();

                        }

                        continue;

                    }

                    if (48 <= codePoint && codePoint <= 57) {

                        //the rules dictate there are several possibilities.
                        //For example, we can append numbers to decimal values, simple numerics, and characters.
                        //it's better to handle each case specifically
                        if (this.presentState == TokenType.ScanningState) {

                            //we morph it to integer
                            this.presentState = TokenType.Integer;
                            this.span_end++; //keep scanning

                        } else if (this.presentState == TokenType.Identifier) {

                            this.span_end++; //we simply append it

                        } else if (this.presentState == TokenType.Integer) {

                            this.span_end++; //same here

                        } else if (this.presentState == TokenType.RealNumber) {

                            this.span_end++;

                        } else {

                            //there is no rule dictating append rule for number, so we simply this.emitAndAdvance and restart
                            this.emitAndAdvance()
                            this.presentState = TokenType.Integer;

                        }

                        continue;

                    }

                    //we now handle symbols. Let's start with the dot symbol.
                    //Rules dictate that the dot symbol now can be part of dot operator where it's explicit
                    //or can be combined with an integer to form real number

                    if (char == '.') {

                        //we append only to integers
                        if (this.presentState == TokenType.Integer) {
                            //change it
                            this.presentState = TokenType.RealNumber;
                            this.span_end++;

                        } else if (this.presentState == TokenType.RealNumber) {

                            throw Error("Real number cannot have multiple decimal points")
                            //this is an error. You cannot have multiple points on a real number

                        } else if (this.presentState == TokenType.ScanningState) {

                            this.presentState = TokenType.Dot
                            //so far, it's standalone
                            this.emitAndAdvance()

                        } else {

                            //we this.emitAndAdvance.
                            this.emit()
                            this.jump()
                            this.presentState = TokenType.Dot
                            //dot is also standalone
                            this.emitAndAdvance()

                        }

                        continue;

                    }

                    if (char == '(') {
                        this.soloCharacter(TokenType.LBrace)
                        continue;
                    }

                    if (char == ')') {
                        this.soloCharacter(TokenType.RBrace)
                        continue;
                    }

                    if (char == '[') {
                        this.soloCharacter(TokenType.LSquareBrace)
                        continue;
                    }

                    if (char == ']') {
                        this.soloCharacter(TokenType.RSquareBrace)
                        continue;
                    }

                    if (char == '{') {
                        this.soloCharacter(TokenType.LBracket)
                        continue;
                    }

                    if (char == '}') {
                        this.soloCharacter(TokenType.RBracket)
                        continue;
                    }

                    if (char == ',') {
                        this.soloCharacter(TokenType.Comma)
                        continue;
                    }

                    if (char == ';') {
                        this.soloCharacter(TokenType.Semicolon)
                        continue;
                    }

                    if ( char == "#" ) {
                        this.soloCharacter(TokenType.HashSymbol);
                        continue;
                    }

                    if ( char == "`" ) {
                        this.soloCharacter(TokenType.Backtick);
                        continue;
                    }

                    if (char == "*") {
                        this.soloCharacter(TokenType.Multiply)
                        continue;
                    }

                    //we will add nuances when adding comments
                    if (char == "/") {
                        this.soloCharacter(TokenType.Divide)
                        continue;
                    }

                    if ( char == '@' ) {
                        this.soloCharacter(TokenType.AtSymbol)
                        continue;
                    }

                    if (char == '-') {
                        const next = this.peek()
                        if (next == ">") {

                            if (this.presentState == TokenType.ScanningState) {
                                this.presentState = TokenType.ArrowRight;
                                this.jump(); this.span_end++

                                this.pureEmit(); this.advance()
                            } else {
                                this.emit()
                                this.jump()
                                this.presentState = TokenType.ArrowRight;
                                this.span_end++

                                this.pureEmit(); this.advance()
                            }

                        } else if (next == "-") {
                            if (this.presentState == TokenType.ScanningState) {
                                this.presentState = TokenType.Decrement;
                                this.jump(); this.span_end++

                                this.pureEmit(); this.advance()
                            } else {
                                this.emit()
                                this.jump()
                                this.presentState = TokenType.Decrement;
                                this.span_end++

                                this.pureEmit(); this.advance()
                            }
                        } else {
                            this.soloCharacter(TokenType.Minus)
                        }

                        continue;
                    }

                    if (char == ':') {
                        this.doubleCharacter(TokenType.Colon, TokenType.DoubleColon, ':')
                        continue;
                    }

                    if (char == "!") {
                        this.doubleCharacter(TokenType.Negation, TokenType.NotEqual, "=")
                        continue
                    }

                    if (char == "<") {
                        this.doubleCharacter(TokenType.LessThan, TokenType.LessThanEqual, "=")
                        continue
                    }

                    if (char == ">") {
                        this.doubleCharacter(TokenType.GreaterThan, TokenType.GreaterThanEqual, "=")
                        continue
                    }

                    if (char == '+') {
                        this.doubleCharacter(TokenType.Add, TokenType.Increment, "+")
                        continue;
                    }

                    if (char == '=') {

                        this.doubleCharacter(TokenType.Assignment, TokenType.Compare, "=")
                        continue

                    }

                    if (char == '"') {

                        if (this.presentState == TokenType.ScanningState) {

                            this.jump();
                            this.span_end = this.processString(this.span_end + 1);
                            this.presentState = TokenType.String;
                            this.pureEmit(); this.advance()

                        } else {

                            this.emit(); this.jump();
                            this.span_end = this.processString(this.span_end + 1);
                            this.presentState = TokenType.String;
                            this.pureEmit(); this.advance()

                        }

                        continue

                    }

                    //console.log(`DEBUG: span_end=${this.span_end} char='${this.source[this.span_end]}' source[span_end-1]='${this.source[this.span_end-1]}'`)
                    //throw Error(`Error: Unrecognized Character "${char.codePointAt(0)}"`)
                    this.logCharError(char, "Unrecognized Character")

            }

        }

        //add the final EOF token
        this.tokens.push(new Token(TokenType.EOF, new StringSpan(this.source.length, this.source.length, this.sourceContainer), this.row, this.col))

    }

}