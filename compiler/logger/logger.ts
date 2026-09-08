export enum LogType {
    Error,
    Warning,
    Info,
}

export interface LogOptions {
    type: LogType;
    where: string;
    title: string;
    description?: string;
    suggestion?: string;
}

export const logCount: Record<LogType, number> = {
    [LogType.Error]: 0,
    [LogType.Warning]: 0,
    [LogType.Info]: 0,
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GRAY = "\x1b[90m";

const COLORS: Record<LogType, string> = {
    [LogType.Error]: "\x1b[31m",
    [LogType.Warning]: "\x1b[33m",
    [LogType.Info]: "\x1b[36m",
};

export function log({
    type,
    where,
    title,
    description,
    suggestion,
}: LogOptions) {
    const count = ++logCount[type];
    const label = LogType[type].toUpperCase();
    const color = COLORS[type];

    console.log(
        `${color}${BOLD}(${count}) [${label}${RESET} : ${where}] ` +
        `${BOLD}${title}${RESET}`
    );

    if (description)
        console.log(
            `${GRAY}description:${RESET}\n` +
            `  ${description}\n`
        );

    if (suggestion)
        console.log(
            `${GRAY}suggestion:${RESET}\n` +
            `  ${suggestion}`
        );

    console.log();
}