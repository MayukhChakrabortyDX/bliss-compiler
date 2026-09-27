/*
 * Reports an unrecoverable internal error — a bug in the
 * product itself, not something caused by the user's input.
 * Mirrors log()'s signature (type, stage, message, description),
 * minus `type` since there's only one kind of fatal, but is
 * styled apart (violet, full-width banner) so it's unmistakable
 * that this is a crash in the product — not a diagnostic about
 * the user's code — and that it should be reported. It always
 * terminates the process, since by definition there is no safe
 * way to continue.
 */
export function fatal(
    stage: string,
    message: string,
    description: string
): never {
    const RESET = "\x1b[0m";
    const BOLD = "\x1b[1m";
    const DIM = "\x1b[2m";
    const ITALIC = "\x1b[3m";

    const FG_BANNER = "\x1b[38;5;196m";
    const FG_RED = "\x1b[38;5;203m";
    const FG_YELLOW = "\x1b[38;5;220m";
    const FG_MUTED = "\x1b[38;5;244m";

    const timestamp = new Date()
        .toTimeString()
        .split(" ")[0];

    console.log();
    console.log(
        `${FG_BANNER}${BOLD}::FATAL — INTERNAL ERROR${RESET}`
    );
    console.log();
    console.log(
        `${DIM}${timestamp}${RESET}  ` +
        `${FG_YELLOW}${BOLD}[${stage.toUpperCase()}]${RESET}`
    );
    console.log();
    console.log(
        `${FG_RED}${BOLD}${message}${RESET}`
    );

    if (description) {
        console.log();
        console.log(
            `${FG_MUTED}${ITALIC}${description}${RESET}`
        );
    }

    console.log();
    console.log(
        `${BOLD}this is a bug in the product, not your code.${RESET}`
    );
    console.log(
        `${FG_MUTED}please report it, including the details above.${RESET}`
    );
    console.log();

    process.exit(1);
}

fatal("parser", "message", `Some strong description`)