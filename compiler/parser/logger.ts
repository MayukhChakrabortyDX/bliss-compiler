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

    switch (type) {
        case Log.Error:
            label = `${BG_ERROR} ERROR ${RESET}`;
            accentColor = TEXT_ERROR;
            break;

        case Log.Warning:
            label = `${BG_WARN} WARN  ${RESET}`;
            accentColor = TEXT_WARN;
            break;

        case Log.Info:
            label = `${BG_INFO} INFO  ${RESET}`;
            accentColor = TEXT_INFO;
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
         * Prepare rendered lines.
         *
         * Tabs are expanded so the underline
         * and diagnostic text stay aligned.
         */
        const renderedLines =
            context.map(i => {
                const line =
                    sourceLines[i] ?? "";

                const lineLabel =
                    String(i + 1).padStart(
                        lineLabelWidth,
                        " "
                    );

                return {
                    index: i,
                    lineLabel,
                    line: line.replace(
                        /\t/g,
                        "    "
                    )
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

            const tokenStart =
                caretPad.length;

            const before =
                line.substring(
                    0,
                    tokenStart
                );

            const tokenPart =
                line.substring(
                    tokenStart,
                    tokenStart + tokenLength
                );

            const after =
                line.substring(
                    tokenStart + tokenLength
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
            caretPad.length;

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
            message.length;

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
            const renderedLine =
                index === lineNum
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

            console.log(
                `${TEXT_BLUE}${BOLD}  │${RESET} ` +
                `${index === lineNum
                    ? TEXT_WHITE
                    : DIM
                }` +
                `${lineLabel}${RESET} ` +
                `${TEXT_BLUE}│${RESET} ` +
                `${
                    index === lineNum
                        ? TEXT_WHITE
                        : DIM
                }${renderedLine}${RESET}` +
                `${padding} ` +
                `${TEXT_BLUE}${BOLD}│${RESET}`
            );

            /*
             * Diagnostic message.
             *
             * It begins at exactly the same
             * horizontal position as the token.
             */
            if (index === lineNum) {
                const messagePadding =
                    " ".repeat(
                        Math.max(
                            sourceWidth -
                            messageStart -
                            suggestion.length,
                            0
                        )
                    );

                console.log(
                    `${TEXT_BLUE}${BOLD}  │${RESET} ` +
                    `${" ".repeat(messageStart)}` +
                    `${TEXT_ERROR}${BOLD}` +
                    `${suggestion}` +
                    `${RESET}` +
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
            `     ${DIM}token:${RESET} ` +
            `${BOLD}${tokenName}${RESET} ` +
            `${DIM}(${JSON.stringify(tokenText)})${RESET}`
        );

        console.log();
    }
}