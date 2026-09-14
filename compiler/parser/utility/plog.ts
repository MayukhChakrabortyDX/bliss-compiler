export enum Log { Warning, Error, Info }

export function log(type: Log, stage: string, message: string, description: string): void {
    // ANSI Escape Codes for Colors & Formatting
    const RESET = "\x1b[0m";
    const BOLD = "\x1b[1m";
    const DIM = "\x1b[2m";

    const BG_ERROR = "\x1b[41m\x1b[37m";   // Red Background, White Text
    const BG_WARN = "\x1b[43m\x1b[30m";    // Yellow Background, Black Text
    const BG_INFO = "\x1b[44m\x1b[37m";    // Blue Background, White Text

    const TEXT_ERROR = "\x1b[31m";         // Red Text
    const TEXT_WARN = "\x1b[33m";          // Yellow Text
    const TEXT_INFO = "\x1b[36m";          // Cyan Text

    let label = "";
    let accentColor = "";

    // Assign styles based on the log type
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

    // Format timestamp for context (HH:MM:SS)
    const timestamp = new Date().toTimeString().split(' ')[0];

    // Construct a structured, beautiful log layout
    console.log(
        `${DIM}[${timestamp}]${RESET} ` +
        `${label} ` +
        `${accentColor}${BOLD}[${stage.toUpperCase()}]${RESET} ` +
        `${BOLD}${message}${RESET}`
    );

    if (description) {
        console.log(`${DIM}  └─ ${description}${RESET}\n`);
    }
}