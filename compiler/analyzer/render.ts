export const RESET = "\x1b[0m";
export const BOLD = "\x1b[1m";
export const ITALIC = "\x1b[3m";

// Same palette as ParserLogger so both stages look cohesive.
export const FG_ERROR = "\x1b[38;5;203m";
export const FG_BORDER = "\x1b[38;5;103m";
export const FG_TEXT = "\x1b[38;5;253m";
export const FG_MUTED = "\x1b[38;5;244m";
export const FG_SUGGEST = "\x1b[38;5;222m";

export interface Annotation {
    col: number;      // tab-expanded start column
    len: number;      // tab-expanded length (>= 1)
    message: string;
}

export const expandTabs = (s: string): string => s.replace(/\t/g, "    ");

const place = (buf: string[], col: number, text: string): void => {
    for (let i = 0; i < text.length; i++) {
        buf[col + i] = text[i] as string;
    }
};

const bufToString = (buf: string[]): string =>
    Array.from(buf, c => c ?? " ").join("").trimEnd();

/** Binary search: which line does this absolute index fall on? */
export function locate(
    lineStarts: number[],
    index: number
): { line: number; col: number } {
    let lo = 0;
    let hi = lineStarts.length - 1;

    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if ((lineStarts[mid] ?? 0) <= index) lo = mid;
        else hi = mid - 1;
    }

    return { line: lo, col: index - (lineStarts[lo] ?? 0) };
}

/**
 * Builds the underline rows for every annotation on one line.
 *
 *   let x = foo + bar;
 *       ^   ^^^   ^^^ third message
 *       │   │
 *       │   ╰─ second message
 *       ╰─ first message
 *
 * The rightmost annotation's message sits on the caret row itself,
 * the others hang below it on connector lines.
 */
export function buildAnnotationRows(anns: Annotation[]): string[] {
    const sorted = [...anns].sort((a, b) => a.col - b.col);
    const rows: string[] = [];

    const caretBuf: string[] = [];
    for (const a of sorted) place(caretBuf, a.col, "^".repeat(a.len));

    const rightmost = sorted[sorted.length - 1]!;
    place(caretBuf, rightmost.col + rightmost.len + 1, rightmost.message);
    rows.push(bufToString(caretBuf));

    // Remaining annotations, rightmost first.
    const pending = sorted.slice(0, -1);

    if (pending.length > 0) {
        const bars: string[] = [];
        for (const a of pending) place(bars, a.col, "│");
        rows.push(bufToString(bars));
    }

    while (pending.length > 0) {
        const current = pending.pop()!;
        const buf: string[] = [];
        for (const a of pending) place(buf, a.col, "│");
        place(buf, current.col, `╰─ ${current.message}`);
        rows.push(bufToString(buf));
    }

    return rows;
}