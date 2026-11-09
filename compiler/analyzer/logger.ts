import { applyWindow, chooseWindowStart, MAX_LINE_WIDTH } from "../parser/logger";
import { AnalyzerBase } from "./base";
import type { AnalyzerDiagnostic } from "./diagnostic";
import {
    BOLD, ITALIC, RESET,
    FG_BORDER, FG_ERROR, FG_MUTED, FG_SUGGEST, FG_TEXT,
    buildAnnotationRows, expandTabs, locate,
    type Annotation
} from "./render";

export class AnalyzerLogger extends AnalyzerBase {

    logDiagnostic(diagnostic: AnalyzerDiagnostic): void {
        const source = this.source.str;
        const sourceLines = source.split("\n");

        const lineStarts: number[] = [0];
        for (let i = 0; i < source.length; i++) {
            if (source[i] === "\n") lineStarts.push(i + 1);
        }

        /*
         * Resolve every error span into (line, col, len).
         * Multi-line spans are clamped to their first line.
         */
        const byLine = new Map<number, Annotation[]>();
        let firstLoc: { line: number; col: number } | undefined;

        for (const { span, message } of diagnostic.errors) {
            const { line, col } = locate(lineStarts, span.startIndex);
            const raw = sourceLines[line] ?? "";

            const endCol = Math.min(
                span.endIndex - (lineStarts[line] ?? 0),
                raw.length - 1
            );

            const startX = expandTabs(raw.substring(0, col)).length;
            const len = Math.max(
                expandTabs(raw.substring(col, endCol + 1)).length,
                1
            );

            if (!byLine.has(line)) byLine.set(line, []);
            byLine.get(line)!.push({ col: startX, len, message });

            firstLoc ??= { line, col: startX };
        }

        const errorLines = [...byLine.keys()].sort((a, b) => a - b);

        const header = (): void => {
            console.log(
                `${FG_ERROR}${BOLD}error${RESET}${BOLD}: ${diagnostic.title}${RESET}`
            );
        };

        if (errorLines.length === 0 || firstLoc === undefined) {
            header();
            console.log();
            return;
        }

        /*
         * Context: nearest non-empty line above/below each error line,
         * merged across errors so nothing prints twice.
         */
        const nonEmpty = (i: number): boolean =>
            i >= 0 && i < sourceLines.length && (sourceLines[i] ?? "").trim().length > 0;

        const shown = new Set<number>(errorLines);

        for (const l of errorLines) {
            for (let i = l - 1; i >= 0; i--) {
                if (nonEmpty(i)) { shown.add(i); break; }
            }
            for (let i = l + 1; i < sourceLines.length; i++) {
                if (nonEmpty(i)) { shown.add(i); break; }
            }
        }

        const ordered = [...shown].sort((a, b) => a - b);
        const labelWidth = String(Math.max(...ordered) + 1).length;
        const pad = " ".repeat(labelWidth);

        /*
         * Header
         */
        header();
        console.log(
            `${pad} ${FG_BORDER}╭─▶ ${RESET}` +
            `${FG_MUTED}line ${firstLoc.line + 1}, column ${firstLoc.col + 1}${RESET}`
        );
        console.log(`${pad} ${FG_BORDER}│${RESET}`);

        /*
         * Window start for each error line (so underlines stay aligned).
         */
        const windows = new Map<number, number>();

        for (const l of errorLines) {
            const line = expandTabs(sourceLines[l] ?? "");
            const anns = [...byLine.get(l)!].sort((a, b) => a.col - b.col);
            const first = anns[0]!;
            const groupEnd = Math.max(...anns.map(a => a.col + a.len));
            const groupLen = groupEnd - first.col;

            // Prefer a window covering every error on the line; else focus the first.
            const focusLen =
                groupLen <= MAX_LINE_WIDTH - 6 ? groupLen : first.len;

            windows.set(l, chooseWindowStart(line.length, first.col, focusLen));
        }

        const windowFor = (l: number): number => {
            const w = windows.get(l);
            if (w !== undefined) return w;

            // Context line: borrow the window of the closest error line.
            let best = errorLines[0]!;
            for (const e of errorLines) {
                if (Math.abs(e - l) < Math.abs(best - l)) best = e;
            }
            return windows.get(best) ?? 0;
        };

        /*
         * Source lines
         */
        let previous: number | undefined;

        for (const index of ordered) {
            // Gap marker if we skipped over real code.
            if (previous !== undefined && index - previous > 1) {
                let skippedCode = false;
                for (let i = previous + 1; i < index; i++) {
                    if (nonEmpty(i)) { skippedCode = true; break; }
                }
                if (skippedCode) {
                    console.log(`${FG_MUTED}${" ".repeat(labelWidth - 1)}⋮${RESET} ${FG_BORDER}│${RESET}`);
                }
            }
            previous = index;

            const windowStart = windowFor(index);
            const rendered = applyWindow(expandTabs(sourceLines[index] ?? ""), windowStart);
            const label = String(index + 1).padStart(labelWidth, " ");
            const anns = byLine.get(index);

            if (anns === undefined) {
                console.log(
                    `${FG_MUTED}${label}${RESET} ${FG_BORDER}│${RESET} ` +
                    `${FG_MUTED}${rendered}${RESET}`
                );
                continue;
            }

            // Split into annotations visible in the window vs. cut off by it.
            const visible: Annotation[] = [];
            const hidden: Annotation[] = [];

            for (const a of anns) {
                const col = a.col - windowStart;
                if (col >= 0 && col < MAX_LINE_WIDTH) {
                    visible.push({
                        col,
                        len: Math.min(a.len, MAX_LINE_WIDTH - col),
                        message: a.message
                    });
                } else {
                    hidden.push(a);
                }
            }

            // Highlight each visible span inside the source line.
            let out = "";
            let cursor = 0;

            for (const a of [...visible].sort((x, y) => x.col - y.col)) {
                const s = Math.max(a.col, cursor);
                const e = Math.min(a.col + a.len, rendered.length);
                if (e <= s) continue;

                out +=
                    rendered.substring(cursor, s) +
                    `${FG_ERROR}${BOLD}${rendered.substring(s, e)}${RESET}${FG_TEXT}`;
                cursor = e;
            }
            out += rendered.substring(cursor);

            console.log(
                `${FG_ERROR}${BOLD}${label}${RESET} ${FG_BORDER}│${RESET} ` +
                `${FG_TEXT}${out}${RESET}`
            );

            if (visible.length > 0) {
                for (const row of buildAnnotationRows(visible)) {
                    console.log(
                        `${pad} ${FG_BORDER}│${RESET} ${FG_ERROR}${BOLD}${row}${RESET}`
                    );
                }
            }

            for (const a of hidden) {
                console.log(
                    `${pad} ${FG_BORDER}┆${RESET} ` +
                    `${FG_ERROR}↳ column ${a.col + 1}: ${a.message}${RESET}`
                );
            }
        }

        /*
         * Footer
         */
        const count = diagnostic.errors.length;

        console.log(`${pad} ${FG_BORDER}│${RESET}`);
        console.log(
            `${pad} ${FG_BORDER}╰─${RESET} ` +
            `${FG_SUGGEST}${BOLD}found:${RESET}${FG_SUGGEST}${ITALIC} ` +
            `${count} ${count === 1 ? "issue" : "issues"}${RESET}`
        );
        console.log();
    }

    /** Print many diagnostics in sequence. */
    logDiagnostics(diagnostics: AnalyzerDiagnostic[]): void {
        for (const d of diagnostics) this.logDiagnostic(d);
    }
}