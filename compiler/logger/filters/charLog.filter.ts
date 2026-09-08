import { TokenType } from "../../lexer/tokens";
import type { LogContext, LogFilter } from "../logger";

/**
 * Two-stage factory for a char/state-aware filter (used during tokenization,
 * before a full Token exists yet).
 *
 * Stage 1 — `charLogFilter(source)`: closes over the raw source string,
 * fixed per file/compilation unit. Build this once.
 *
 * Stage 2 — the returned function takes the offending `char`, the current
 * lexer `state` (as a TokenType-like state marker), and the `position` in
 * source where it occurred, producing the actual `LogFilter`.
 *
 * Usage:
 *   const forSource = charLogFilter(this.source);
 *   Log({ ..., filter: forSource(char, this.presentState, this.span_end) });
 */
export function charLogFilter(source: string): (char: string, state: number, position: number) => LogFilter {
    return (char: string, state: number, position: number): LogFilter => {
        return (ctx: LogContext) => {
            const { stage, message, description, useLLM } = ctx;

            const stateName = TokenType[state] ?? "Unknown";
            const codePoint = char.codePointAt(0) ?? 0;
            const codePointHex = codePoint.toString(16).toUpperCase().padStart(4, "0");

            const upToStart = source.substring(0, position);
            const lineNum = upToStart.split("\n").length - 1;
            const lastNL = upToStart.lastIndexOf("\n");
            const col = position - (lastNL + 1);
            const line = source.split("\n")[lineNum] ?? "";
            const caretPad = " ".repeat(line.substring(0, col).replace(/\t/g, "    ").length);
            const rowLabel = lineNum + 1;
            const colLabel = caretPad.length + 1;

            if (useLLM) {
                console.log(`ERROR: ${message}`);
                console.log(`STAGE: ${stage.toUpperCase()}`);
                console.log(`LOCATION: line=${rowLabel} col=${colLabel}`);
                console.log(`STATE: ${stateName}`);
                console.log(`CHAR: ${JSON.stringify(char)} (U+${codePointHex})`);
                console.log(`SOURCE: ${line}`);
                console.log(`CARET: ${caretPad}^`);
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
            console.log(`  ${gutter} ${TEXT_ERROR}${BOLD}${caretPad}^${RESET}`);
            if (description) {
                console.log(`  ${gutter} ${DIM}${description}${RESET}`);
            }
            console.log(`${TEXT_BLUE}  ╰─${RESET} ${DIM}state: ${stateName}, char: ${JSON.stringify(char)} (U+${codePointHex})${RESET}`);
            console.log();
        };
    };
}