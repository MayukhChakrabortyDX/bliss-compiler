import { TokenType, type StringContainer, type Token } from "../../lexer/tokens";
import type { LogContext, LogFilter } from "../logger";

function resolveSpan(start: number, source: StringContainer): { line: string; lineNum: number; caretPad: string } {
    const upToStart = source.str.substring(0, start);
    const lineNum = upToStart.split("\n").length - 1;
    const lastNL = upToStart.lastIndexOf("\n");
    const col = start - (lastNL + 1);
    const line = source.str.split("\n")[lineNum] ?? "";
    const caretPad = " ".repeat(line.substring(0, col).replace(/\t/g, "    ").length);
    return { line, lineNum, caretPad };
}

/**
 * Two-stage factory for a token-aware filter.
 *
 * Stage 1 — `tokenLogFilter(source)`: closes over the source, which is fixed
 * per file/compilation unit. Build this once.
 *
 * Stage 2 — the returned function takes the `token` for a specific diagnostic
 * (this varies per call) and produces the actual `LogFilter` to hand to `Log()`.
 *
 * Usage:
 *   const forSource = tokenLogFilter(mySource);       // once per file
 *   Log({ ..., filter: forSource(myToken) });          // once per diagnostic
 */
export function tokenLogFilter(source: StringContainer): (token: Token) => LogFilter {
    return (token: Token): LogFilter => {
        return (ctx: LogContext) => {
            const { stage, message, description, useLLM } = ctx;

            const tokenName = TokenType[token.tokenType] ?? "Unknown";
            const tokenText = token.span.resolve();
            const { line, lineNum, caretPad } = resolveSpan(token.span.startIndex, source);
            const caretLen = Math.max(token.span.endIndex - token.span.startIndex + 1, 1);
            const rowLabel = lineNum + 1;
            const colLabel = caretPad.length + 1;

            if (useLLM) {
                console.log(`ERROR: ${message}`);
                console.log(`STAGE: ${stage.toUpperCase()}`);
                console.log(`LOCATION: line=${rowLabel} col=${colLabel}`);
                console.log(`TOKEN: type=${tokenName} text=${JSON.stringify(tokenText)}`);
                console.log(`SOURCE: ${line}`);
                console.log(`CARET: ${caretPad}${"^".repeat(caretLen)}`);
                if (description) {
                    console.log(`HINT: ${description}`);
                }
                console.log("---");
                return;
            }

            const RESET = "\x1b[0m";
            const BOLD = "\x1b[1m";
            const DIM = "\x1b[2m";
            const TEXT_ERROR = "\x1b[31m";
            const TEXT_BLUE = "\x1b[34m";
            const TEXT_MUTED = "\x1b[90m";

            const lineLabel = String(rowLabel);
            const pad = " ".repeat(lineLabel.length);
            const gutter = `${TEXT_BLUE}${pad} │${RESET}`;
            const gutterNum = `${TEXT_BLUE}${BOLD}${lineLabel} │${RESET}`;

            console.log(`${TEXT_ERROR}${BOLD}✖ error${RESET}${DIM}[${stage.toUpperCase()}]${RESET} ${BOLD}${message}${RESET}`);
            console.log(`${TEXT_MUTED}  ╭─ line ${rowLabel}, col ${colLabel}${RESET}`);
            console.log(`${TEXT_BLUE}  │${RESET}`);
            console.log(`  ${gutterNum} ${line}`);
            console.log(`  ${gutter} ${TEXT_ERROR}${BOLD}${caretPad}${"^".repeat(caretLen)}${RESET}`);
            if (description) {
                console.log(`  ${gutter} ${DIM}${description}${RESET}`);
            }
            console.log(`${TEXT_BLUE}  ╰─${RESET} ${DIM}token: ${tokenName} (${JSON.stringify(tokenText)})${RESET}`);
            console.log();
        };
    };
}