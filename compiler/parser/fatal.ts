export enum Log {
    Warning,
    Error,
    Info,
    Fatal
}

/*
 * A single parsed stack frame, split into the calling function's
 * name and its source location so the two can be aligned/styled
 * independently when rendered.
 */
interface StackFrame {
    fn: string;
    location: string;
}

/*
 * Parses a raw V8 stack trace into structured frames, keeping only
 * the "consequent" call chain — i.e. the actual sequence of user
 * function calls that led here. Stops as soon as it hits runtime/
 * module-loader plumbing (node:internal, bootstrapping, promise
 * job queues, etc.), since those aren't calls the user wrote and
 * just add noise below the point where the trail goes cold.
 */
function parseStackFrames(rawStack: string): StackFrame[] {
    const NOISE = /node:internal|\(internal\/|^at\s+new\s+Promise|processTicksAndRejections/;

    const lines = rawStack
        .split("\n")
        .slice(1) // drop the "Error: <message>" header line
        .map(line => line.trim())
        .filter(line => line.startsWith("at "));

    const frames: StackFrame[] = [];

    for (const line of lines) {
        if (NOISE.test(line)) {
            break; // everything past this point is runtime plumbing, not a real call
        }

        const match = line.match(/^at\s+(.+?)\s+\((.+)\)$/) ??
            line.match(/^at\s+(.+)$/);

        if (!match) {
            continue;
        }

        if (match.length === 3) {
            frames.push({ fn: match[1], location: match[2] });
        } else {
            // Anonymous frame with no function name, just "at file:line:col"
            frames.push({ fn: "<anonymous>", location: match[1] });
        }
    }

    return frames;
}

/*
 * For unrecoverable internal errors — invariant violations,
 * "this should never happen" branches, corrupted internal state,
 * assertion failures. Not for user-facing syntax errors.
 *
 * `description` is optional free-form context you attach yourself
 * (what was being attempted, expected vs. actual state, etc.),
 * separate from the one-line `message`.
 *
 * Prints the call chain that led here (the caller's stack, or one
 * captured on the spot) since the cause lives in our code, not the
 * user's source, and terminates the process — by definition there
 * is no safe way to continue once this fires. Pass `exit: false`
 * to intercept that (e.g. under test).
 */
export function logFatal(
    stage: string,
    message: string,
    options: {
        description?: string;
        error?: Error;
        exit?: boolean;
    } = {}
): never {
    const { description, error, exit = true } = options;

    const RESET = "\x1b[0m";
    const BOLD = "\x1b[1m";
    const DIM = "\x1b[2m";
    const ITALIC = "\x1b[3m";

    const FG_FATAL = "\x1b[38;5;196m";
    const FG_TEXT = "\x1b[38;5;253m";
    const FG_MUTED = "\x1b[38;5;244m";
    const FG_FRAME_FN = "\x1b[38;5;189m";
    const FG_FRAME_ARROW = "\x1b[38;5;131m";
    const CHIP_FATAL = "\x1b[48;5;196m\x1b[38;5;231m";

    const timestamp = new Date().toTimeString().split(" ")[0];

    console.log();
    console.log(
        `${CHIP_FATAL} ${BOLD} ☠ FATAL ${RESET} ` +
        `${DIM}${timestamp}${RESET} ` +
        `${FG_FATAL}${ITALIC}${stage.toUpperCase()}${RESET}`
    );
    console.log();
    console.log(`  ${FG_TEXT}${BOLD}${message}${RESET}`);

    if (description) {
        console.log(`  ${FG_MUTED}${ITALIC}${description}${RESET}`);
    }

    const rawStack =
        error?.stack ?? new Error().stack ?? "";

    const frames = parseStackFrames(rawStack);

    if (frames.length > 0) {
        const fnWidth = Math.max(...frames.map(f => f.fn.length));

        console.log();
        console.log(`  ${FG_MUTED}${ITALIC}Call chain:${RESET}`);

        for (const { fn, location } of frames) {
            console.log(
                `    ${FG_FRAME_ARROW}→${RESET} ` +
                `${FG_FRAME_FN}${fn.padEnd(fnWidth, " ")}${RESET}  ` +
                `${DIM}${location}${RESET}`
            );
        }
    }

    console.log();

    if (exit) {
        process.exit(1);
    }

    // Satisfies the `never` return type when exit is suppressed
    // (e.g. under test) — callers should not rely on reaching here.
    throw error ?? new Error(message);
}

logFatal("Parser", "Unrecoverable internal error", {
    description: "This is a placeholder fatal error to demonstrate the logFatal function.",
    exit: false
});