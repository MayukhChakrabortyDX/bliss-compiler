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

    const BG_ERROR = "\x1b[41m\x1b[37m";
    const BG_WARN = "\x1b[43m\x1b[30m";
    const BG_INFO = "\x1b[44m\x1b[37m";

    const TEXT_ERROR = "\x1b[31m";
    const TEXT_WARN = "\x1b[33m";
    const TEXT_INFO = "\x1b[36m";

    let label = "";
    let accentColor = "";
    let icon = "";

    switch (type) {
        case Log.Error:
            label = `${BG_ERROR} ✕ ERROR ${RESET}`;
            accentColor = TEXT_ERROR;
            icon = "✕";
            break;

        case Log.Warning:
            label = `${BG_WARN} ⚠ WARN  ${RESET}`;
            accentColor = TEXT_WARN;
            icon = "⚠";
            break;

        case Log.Info:
            label = `${BG_INFO} ℹ INFO  ${RESET}`;
            accentColor = TEXT_INFO;
            icon = "ℹ";
            break;
    }

    const timestamp = new Date()
        .toTimeString()
        .split(" ")[0];

    console.log(
        `${DIM}[${timestamp}]${RESET} ` +
        `${label} ` +
        `${accentColor}${BOLD}[${stage.toUpperCase()}]${RESET} ` +
        `${BOLD}${message}${RESET}`
    );

    if (description) {
        console.log(
            `${DIM}  └─${RESET} ${description}\n`
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

        const TEXT_ERROR = "\x1b[31m";
        const TEXT_BLUE = "\x1b[34m";
        const TEXT_WHITE = "\x1b[37m";

        /*
         * ANSI underline for the offending token.
         */
        const UNDERLINE =
            "\x1b[4m";

        const tokenName =
            TokenType[token.tokenType] ?? "Unknown";

        const tokenText =
            token.span.resolve();

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
                `${TEXT_ERROR}${UNDERLINE}${BOLD}` +
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
         * e.g. "      ^^^^ unexpected token".
         */
        const caretRow =
            " ".repeat(displayTokenStart) +
            "^".repeat(tokenLength);

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
         * Header.
         */
        log(
            Log.Error,
            "PARSER",
            message,
            `line ${lineNum + 1}, column ${caretPad.length + 1}`
        );

        /*
         * Rounded top border.
         */
        console.log(
            `${TEXT_BLUE}${BOLD}` +
            `  ╭${"─".repeat(sourceWidth + 2)}╮` +
            `${RESET}`
        );

        /*
         * Source lines.
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

            const visibleContent =
                `${lineLabel} │ ${line}`;

            const padding =
                " ".repeat(
                    Math.max(
                        sourceWidth -
                        visibleContent.length,
                        0
                    )
                );

            const gutterMarker =
                isOffending
                    ? `${TEXT_ERROR}${BOLD}▶${RESET}`
                    : `${TEXT_BLUE}${BOLD}│${RESET}`;

            console.log(
                `  ${gutterMarker} ` +
                `${isOffending
                    ? TEXT_ERROR + BOLD
                    : DIM
                }` +
                `${lineLabel}${RESET} ` +
                `${TEXT_BLUE}│${RESET} ` +
                `${
                    isOffending
                        ? TEXT_WHITE
                        : DIM
                }${renderedLine}${RESET}` +
                `${padding} ` +
                `${TEXT_BLUE}${BOLD}│${RESET}`
            );

            /*
             * Caret + diagnostic message, drawn directly
             * under the offending token — rustc/eslint style.
             */
            if (isOffending) {
                const caretText =
                    `${caretRow} ${suggestion}`;

                const messagePadding =
                    " ".repeat(
                        Math.max(
                            sourceWidth -
                            lineLabelWidth -
                            3 -
                            caretText.length,
                            0
                        )
                    );

                console.log(
                    `  ${TEXT_BLUE}${BOLD}│${RESET} ` +
                    `${" ".repeat(lineLabelWidth)} ` +
                    `${TEXT_BLUE}│${RESET} ` +
                    `${TEXT_ERROR}${BOLD}` +
                    `${caretRow}${RESET} ` +
                    `${TEXT_ERROR}${suggestion}${RESET}` +
                    `${messagePadding} ` +
                    `${TEXT_BLUE}${BOLD}│${RESET}`
                );
            }
        }

        /*
         * Rounded bottom border.
         */
        console.log(
            `${TEXT_BLUE}${BOLD}` +
            `  ╰${"─".repeat(sourceWidth + 2)}╯` +
            `${RESET}`
        );

        /*
         * Token information.
         */
        console.log(
            `     ${DIM}token${RESET} ` +
            `${TEXT_BLUE}›${RESET} ` +
            `${BOLD}${tokenName}${RESET} ` +
            `${DIM}(${JSON.stringify(tokenText)})${RESET}`
        );

        console.log();
    }
}