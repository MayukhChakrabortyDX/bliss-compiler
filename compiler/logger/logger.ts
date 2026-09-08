import { StringContainer, TokenType, type Token } from "../lexer/tokens";

export enum LogType { Warning, Error, Info }

/** Context passed to every filter — fully generic, no filter-specific fields. */
export interface LogContext {
    type: LogType;
    stage: string;
    message: string;
    description?: string;
    useLLM: boolean;
}

/** A filter is just a function that knows how to render a LogContext. */
export type LogFilter = (ctx: LogContext) => void;

export interface LogOptions {
    type: LogType;
    stage: string;
    message: string;
    description?: string;
    useLLM?: boolean;
    filter?: LogFilter;
}

const ICON: Record<LogType, string> = {
    [LogType.Error]: "✖",
    [LogType.Warning]: "▲",
    [LogType.Info]: "ℹ",
};

const LABEL: Record<LogType, string> = {
    [LogType.Error]: "ERROR",
    [LogType.Warning]: "WARN",
    [LogType.Info]: "INFO",
};

const COLOR: Record<LogType, string> = {
    [LogType.Error]: "\x1b[31m",   // red
    [LogType.Warning]: "\x1b[33m", // yellow
    [LogType.Info]: "\x1b[36m",    // cyan
};

/**
 * Default filter: modern minimal single/dual-line log for humans,
 * or a flat key/value block for LLM agents.
 */
export const defaultFilter: LogFilter = (ctx) => {
    const { type, stage, message, description, useLLM } = ctx;

    if (useLLM) {
        console.log(`${LABEL[type]}: [${stage.toUpperCase()}] ${message}`);
        if (description) {
            console.log(`DETAIL: ${description}`);
        }
        console.log("---");
        return;
    }

    const RESET = "\x1b[0m";
    const BOLD = "\x1b[1m";
    const DIM = "\x1b[2m";

    const accentColor = COLOR[type];
    const icon = ICON[type];
    const label = LABEL[type];
    const timestamp = new Date().toTimeString().split(" ")[0];

    console.log(
        `${DIM}${timestamp}${RESET} ` +
        `${accentColor}${BOLD}${icon} ${label}${RESET} ` +
        `${DIM}[${stage.toUpperCase()}]${RESET} ` +
        `${BOLD}${message}${RESET}`
    );

    if (description) {
        console.log(`${DIM}  ╰─ ${description}${RESET}`);
    }
    console.log();
}

/**
 * Single logging entry point. Formatting/output is fully delegated to `filter`
 * (defaults to `defaultFilter`). `useLLM` is passed per-call, not stored globally.
 */
export function Log(options: LogOptions): void {
    const {
        type,
        stage,
        message,
        description,
        useLLM = false,
        filter = defaultFilter,
    } = options;

    filter({ type, stage, message, description, useLLM });
}