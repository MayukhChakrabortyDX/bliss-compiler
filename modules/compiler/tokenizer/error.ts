import { Log, log } from "../../logger";
import { TokenizeBase } from "./helper";
import { Token, TokenType } from "./tokens";

//error handling (much more efficient and verbose) for tokenization phase
export class ErrorHandling extends TokenizeBase {
    private resolveSpan(start: number): { line: string; lineNum: number; caretPad: string } {
        const upToStart = this.source.substring(0, start);
        const lineNum = upToStart.split("\n").length - 1;
        const lastNL = upToStart.lastIndexOf("\n");
        const col = start - (lastNL + 1);
        const line = this.source.split("\n")[lineNum] ?? "";
        const caretPad = " ".repeat(line.substring(0, col).replace(/\t/g, "    ").length);
        return { line, lineNum, caretPad };
    }

    logCharError(char: string, message: string): void {
        const RESET = "\x1b[0m";
        const BOLD = "\x1b[1m";
        const DIM = "\x1b[2m";
        const TEXT_ERROR = "\x1b[31m";
        const TEXT_BLUE = "\x1b[34m";

        const stateName = TokenType[this.presentState] ?? "Unknown";
        const codePoint = char.codePointAt(0) ?? 0;
        const { line, lineNum, caretPad } = this.resolveSpan(this.span_end);
        const lineLabel = String(lineNum + 1);
        const pad = " ".repeat(lineLabel.length);

        log(Log.Error, "TOKENIZER", message, `${TEXT_BLUE}${BOLD} ${RESET}line ${lineNum + 1}, col ${caretPad.length + 1}`)
        console.log(`${TEXT_BLUE}${BOLD}${pad}  |${RESET}`);
        console.log(`${TEXT_BLUE}${BOLD}${lineLabel}  |${RESET} ${line}`);
        console.log(`${TEXT_BLUE}${BOLD}${pad}  |${RESET} ${TEXT_ERROR}${BOLD}${caretPad}^${RESET}`);
        console.log(`${TEXT_BLUE}${BOLD}${pad}  |${RESET} ${DIM}state: ${stateName}, char: ${JSON.stringify(char)} (U+${codePoint.toString(16).toUpperCase().padStart(4, "0")})${RESET}`);
        console.log();
        process.exit(1)
    }
}