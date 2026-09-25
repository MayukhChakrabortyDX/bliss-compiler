import { TokenType, type Token } from "../lexer/tokens";
import { ParserBase } from "./base";

export enum Log {
    Warning,
    Error,
    Info
}

export function log(
    type: Log,
    stage: string,
    message: string,
    description: string
): void {
    const RESET = "\x1b[0m";
    const BOLD = "\x1b[1m";
    const DIM = "\x1b[2m";
    const ITALIC = "\x1b[3m";

    // Softer, more modern palette (256-color) instead of harsh basic ANSI.
    const FG_ERROR = "\x1b[38;5;203m";
    const FG_WARN = "\x1b[38;5;215m";
    const FG_INFO = "\x1b[38;5;110m";

    const CHIP_ERROR = "\x1b[48;5;203m\x1b[38;5;236m";
    const CHIP_WARN = "\x1b[48;5;215m\x1b[38;5;236m";
    const CHIP_INFO = "\x1b[48;5;110m\x1b[38;5;236m";

    let chip = "";
    let accentColor = "";
    let icon = "";

    switch (type) {
        case Log.Error:
            icon = "✕";
            chip = `${CHIP_ERROR} ${BOLD} ${icon} ERROR ${RESET}`;
            accentColor = FG_ERROR;
            break;

        case Log.Warning:
            icon = "⚠";
            chip = `${CHIP_WARN} ${BOLD} ${icon} WARN  ${RESET}`;
            accentColor = FG_WARN;
            break;

        case Log.Info:
            icon = "ℹ";
            chip = `${CHIP_INFO} ${BOLD} ${icon} INFO  ${RESET}`;
            accentColor = FG_INFO;
            break;
    }

    const timestamp = new Date()
        .toTimeString()
        .split(" ")[0];

    console.log(
        `${DIM}${timestamp}${RESET} ` +
        `${chip} ` +
        `${accentColor}${ITALIC}${stage.toUpperCase()}${RESET} ` +
        `${BOLD}${message}${RESET}`
    );

    if (description) {
        console.log(
            `${DIM}   ╰─ ${description}${RESET}\n`
        );
    }
}

/*
 * Maximum number of source characters shown per line
 * inside the diagnostic box. Longer lines are truncated
 * with a leading/trailing ellipsis, keeping the box a
 * predictable, readable width.
 */
const MAX_LINE_WIDTH = 50;
const ELLIPSIS = "...";

/*
 * Given a line and the start offset already chosen for
 * the "focus" line (the offending line), slice out the
 * same horizontal window from any line so that everything
 * inside the box stays column-aligned.
 */
function applyWindow(
    line: string,
    windowStart: number
): string {
    if (windowStart === 0 && line.length <= MAX_LINE_WIDTH) {
        return line;
    }

    const start = Math.min(windowStart, Math.max(line.length - 1, 0));
    const end = Math.min(start + MAX_LINE_WIDTH, line.length);

    let text = line.substring(start, end);

    if (start > 0 && text.length > ELLIPSIS.length) {
        text = ELLIPSIS + text.substring(ELLIPSIS.length);
    }

    if (end < line.length && text.length > ELLIPSIS.length) {
        text = text.substring(0, text.length - ELLIPSIS.length) + ELLIPSIS;
    }

    return text;
}

/*
 * Choose the horizontal window (character offset) for the
 * offending line so that the highlighted token is centered
 * and visible, reserving room on both sides for ellipses.
 */
function chooseWindowStart(
    lineLength: number,
    focusStart: number,
    focusLen: number
): number {
    if (lineLength <= MAX_LINE_WIDTH) {
        return 0;
    }

    let start =
        focusStart - Math.floor((MAX_LINE_WIDTH - focusLen) / 2);

    start = Math.max(0, Math.min(start, lineLength - MAX_LINE_WIDTH));

    return start;
}

export class ParserLogger extends ParserBase {
    resolveSpan(
        start: number
    ): {
        line: string;
        lineNum: number;
        caretPad: string;
    } {
        const upToStart =
            this.source.str.substring(0, start);

        const lineNum =
            upToStart.split("\n").length - 1;

        const lastNL =
            upToStart.lastIndexOf("\n");

        const col =
            start - (lastNL + 1);

        const line =
            this.source.str.split("\n")[lineNum] ?? "";

        const caretPad =
            " ".repeat(
                line
                    .substring(0, col)
                    .replace(/\t/g, "    ")
                    .length
            );

        return {
            line,
            lineNum,
            caretPad
        };
    }

    logTokenError(
        token: Token,
        message: string,
        suggestion: string = message
    ): void {
        const RESET = "\x1b[0m";
        const BOLD = "\x1b[1m";
        const DIM = "\x1b[2m";
        const ITALIC = "\x1b[3m";

        // Softened, cohesive 256-color palette.
        const FG_ERROR = "\x1b[38;5;203m";
        const FG_BORDER = "\x1b[38;5;103m";
        const FG_TEXT = "\x1b[38;5;253m";
        const FG_MUTED = "\x1b[38;5;244m";
        const FG_SUGGEST = "\x1b[38;5;222m";

        const tokenName =
            TokenType[token.tokenType] ?? "Unknown";

        let tokenDisplay = "";
        if (tokenName.startsWith("K_")) {
            tokenDisplay = `Got keyword ${tokenName.substring(2).toLowerCase()}`;
        } else {
            tokenDisplay = `Got ${tokenName}`;
        }

        const sourceLines =
            this.source.str.split("\n");

        const {
            lineNum,
            caretPad
        } = this.resolveSpan(
            token.span.startIndex
        );

        const tokenLength =
            Math.max(
                token.span.endIndex -
                token.span.startIndex +
                1,
                1
            );

        /*
         * Find the nearest non-empty lines
         * above and below the offending line.
         */
        const nonEmpty = (
            i: number
        ): boolean => {
            if (
                i < 0 ||
                i >= sourceLines.length
            ) {
                return false;
            }

            return (
                sourceLines[i] ?? ""
            ).trim().length > 0;
        };

        const above: number[] = [];
        const below: number[] = [];

        for (
            let i = lineNum - 1;
            i >= 0 && above.length < 2;
            i--
        ) {
            if (nonEmpty(i)) {
                above.unshift(i);
            }
        }

        for (
            let i = lineNum + 1;
            i < sourceLines.length &&
            below.length < 2;
            i++
        ) {
            if (nonEmpty(i)) {
                below.push(i);
            }
        }

        /*
         * Determine context.
         */
        let context: number[];

        if (sourceLines.length === 1) {
            context = [lineNum];
        } else if (above.length === 0) {
            context = [
                lineNum,
                ...below
            ];
        } else if (below.length === 0) {
            context = [
                ...above,
                lineNum
            ];
        } else {
            const previous =
                above.at(-1);

            const next =
                below.at(0);

            if (
                previous === undefined ||
                next === undefined
            ) {
                context = [lineNum];
            } else {
                context = [
                    previous,
                    lineNum,
                    next
                ];
            }
        }

        /*
         * Line-number width.
         */
        const lineLabelWidth =
            String(
                Math.max(
                    ...context.map(
                        i => i + 1
                    )
                )
            ).length;

        /*
         * Prepare rendered lines (tab-expanded first,
         * horizontal truncation window applied second).
         */
        const tabExpanded =
            context.map(i => {
                const raw =
                    sourceLines[i] ?? "";

                return {
                    index: i,
                    line: raw.replace(/\t/g, "    ")
                };
            });

        const offendingRaw =
            tabExpanded.find(
                ({ index }) => index === lineNum
            );

        const tokenStart =
            caretPad.length;

        const windowStart =
            offendingRaw !== undefined
                ? chooseWindowStart(
                    offendingRaw.line.length,
                    tokenStart,
                    tokenLength
                )
                : 0;

        /*
         * The token's start column once the horizontal
         * truncation window has been applied.
         */
        const displayTokenStart =
            Math.max(tokenStart - windowStart, 0);

        const renderedLines =
            tabExpanded.map(({ index, line }) => {
                const lineLabel =
                    String(index + 1).padStart(
                        lineLabelWidth,
                        " "
                    );

                return {
                    index,
                    lineLabel,
                    line: applyWindow(line, windowStart)
                };
            });

        /*
         * Highlight the offending token.
         */
        const offendingLine =
            renderedLines.find(
                ({ index }) =>
                    index === lineNum
            );

        let highlightedLine = "";

        if (offendingLine !== undefined) {
            const line =
                offendingLine.line;

            const before =
                line.substring(
                    0,
                    displayTokenStart
                );

            const tokenPart =
                line.substring(
                    displayTokenStart,
                    displayTokenStart + tokenLength
                );

            const after =
                line.substring(
                    displayTokenStart + tokenLength
                );

            highlightedLine =
                before +
                `${FG_ERROR}${BOLD}` +
                tokenPart +
                `${RESET}` +
                after;
        }

        /*
         * The message begins exactly where
         * the caret would have begun.
         */
        const messageStart =
            lineLabelWidth +
            3 +
            displayTokenStart;

        /*
         * The caret row drawn under the offending line,
         * using carets to point at the token and appending the formatted token type,
         * e.g. "    ^^^^ Got keyword let".
         */
        const caretRow =
            " ".repeat(displayTokenStart) +
            "^".repeat(tokenLength) +
            ` ${tokenDisplay}`;

        /*
         * Calculate source width.
         */
        const sourceContentWidths =
            renderedLines.map(
                ({ lineLabel, line }) =>
                    lineLabel.length +
                    3 +
                    line.length
            );

        const diagnosticWidth =
            messageStart +
            caretRow.length -
            displayTokenStart +
            1 +
            suggestion.length;

        const sourceWidth =
            Math.max(
                ...sourceContentWidths,
                diagnosticWidth
            );

        /*
         * Header — rustc/eslint style: bold message up top,
         * then a "-->" location line pointing at file position.
         */
        console.log(
            `${FG_ERROR}${BOLD}error${RESET}${BOLD}: ${message}${RESET}`
        );
        console.log(
            `${" ".repeat(lineLabelWidth)} ${FG_BORDER}╭─▶ ${RESET}` +
            `${FG_MUTED}line ${lineNum + 1}, column ${caretPad.length + 1}${RESET}`
        );
        console.log(
            `${" ".repeat(lineLabelWidth)} ${FG_BORDER}│${RESET}`
        );

        /*
         * Source lines — open gutter (no right border), a single
         * vertical rule on the left, numbers dimmed except the
         * offending line.
         */
        for (const {
            index,
            lineLabel,
            line
        } of renderedLines) {
            const isOffending =
                index === lineNum;

            const renderedLine =
                isOffending
                    ? highlightedLine
                    : line;

            console.log(
                `${
                    isOffending
                        ? FG_ERROR + BOLD
                        : FG_MUTED
                }${lineLabel}${RESET} ` +
                `${FG_BORDER}│${RESET} ` +
                `${
                    isOffending
                        ? FG_TEXT
                        : FG_MUTED
                }${renderedLine}${RESET}`
            );

            /*
             * Underline the offending token directly beneath it.
             * The closing "help:" line is deferred until every
             * context line (including ones below the error) has
             * been printed, so it isn't followed by an orphaned
             * source line once the rule closes.
             */
            if (isOffending) {
                console.log(
                    `${" ".repeat(lineLabelWidth)} ` +
                    `${FG_BORDER}│${RESET} ` +
                    `${FG_ERROR}${BOLD}${caretRow}${RESET}`
                );
            }
        }

        console.log(
            `${" ".repeat(lineLabelWidth)} ${FG_BORDER}│${RESET}`
        );

        console.log(
            `${" ".repeat(lineLabelWidth)} ` +
            `${FG_BORDER}╰─${RESET} ` +
            `${FG_SUGGEST}${BOLD}help:${RESET}${FG_SUGGEST}${ITALIC} ${suggestion}${RESET}`
        );

        console.log();
    }
}