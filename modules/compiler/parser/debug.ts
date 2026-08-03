interface CallSite {
    getFunctionName(): string | null;
    getMethodName(): string | null;
    getFileName(): string | null;
    getLineNumber(): number | null;
    getColumnNumber(): number | null;
    isNative(): boolean;
    isConstructor(): boolean;
}

const COLORS = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    gray: '\x1b[90m',
    red: '\x1b[31m',
};

function getRawStack(skipFn: (...args: any[]) => any, limit = 20): CallSite[] {
    const origPrepare = Error.prepareStackTrace;
    const origLimit = Error.stackTraceLimit;

    Error.stackTraceLimit = limit;
    Error.prepareStackTrace = (_, stack) => stack;

    const target = {} as { stack?: CallSite[] };
    Error.captureStackTrace(target, skipFn);

    Error.prepareStackTrace = origPrepare;
    Error.stackTraceLimit = origLimit;

    return target.stack ?? [];
}

function frameName(site: CallSite): string {
    return (
        site.getFunctionName() ??
        site.getMethodName() ??
        (site.isConstructor() ? 'new <anonymous>' : '<anonymous>')
    );
}

function frameLocation(site: CallSite, cwd: string): string {
    const file = site.getFileName() ?? (site.isNative() ? 'native' : 'unknown');
    const rel = file.startsWith(cwd) ? file.slice(cwd.length + 1) : file;
    const line = site.getLineNumber();
    const col = site.getColumnNumber();
    return `${rel}${line != null ? `:${line}` : ''}${col != null ? `:${col}` : ''}`;
}

export function printNestedStackTrace(title = 'Call Chain', limit = 20): void {
    const stack = getRawStack(printNestedStackTrace, limit);
    const cwd = process.cwd();

    // Reverse so the outermost caller is first, deepest call is last
    const chain = [...stack].reverse();

    const lines: string[] = [`${COLORS.red}▶ ${title}${COLORS.reset}`];

    chain.forEach((site, i) => {
        const isLast = i === chain.length - 1;
        const isNodeModules = (site.getFileName() ?? '').includes('node_modules');

        const indent = '  '.repeat(i);
        const connector = i === 0 ? '' : `${COLORS.gray}└─ ${COLORS.reset}`;
        const name = isLast
            ? `${COLORS.yellow}${frameName(site)}${COLORS.reset}` // highlight innermost call
            : `${COLORS.cyan}${frameName(site)}${COLORS.reset}`;
        const location = `${COLORS.gray}(${frameLocation(site, cwd)})${COLORS.reset}`;
        const dim = isNodeModules ? COLORS.dim : '';

        lines.push(`${dim}${indent}${connector}${name} ${location}${COLORS.reset}`);
    });

    console.log(lines.join('\n'));
}