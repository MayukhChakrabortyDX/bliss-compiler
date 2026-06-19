declare const Bun: { argv: string[] };
import * as fs from "fs";
import * as path from "path";
import { Log, log } from './modules/logger';

// ============================================================================
// GLOBAL CONFIGURATION (Edit Name, Version, & Branding easily here)
// ============================================================================
const CLI_CONFIG = {
    name: "bliss",
    version: "1.0.0",
    tagline: "A systems language",
};

// ============================================================================
// THEME — single source of truth for every color/style used below.
// ============================================================================
const THEME = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    accent: [99, 105, 141, 183],
    success: "\x1b[38;5;42m",
    warning: "\x1b[38;5;214m",
    error: "\x1b[38;5;203m",
    muted: "\x1b[38;5;244m",
};

// ============================================================================
// ANSI / LAYOUT HELPERS
// ============================================================================
const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;
const stripAnsi = (str: string): string => str.replace(ANSI_PATTERN, "");
const visibleLength = (str: string): number => stripAnsi(str).length;
const padVisible = (str: string, width: number, char = " "): string =>
    str + char.repeat(Math.max(0, width - visibleLength(str)));

function gradientText(text: string, ramp: number[]): string {
    const chars = text.split("");
    const last = Math.max(chars.length - 1, 1);
    const colored = chars.map((c, i) => {
        const colorIndex = Math.floor((i / last) * (ramp.length - 1));
        return `\x1b[38;5;${ramp[colorIndex]}m${c}`;
    });
    return colored.join("") + THEME.reset;
}

function box(lines: string[]): string {
    const innerWidth = Math.max(...lines.map(visibleLength)) + 2;
    const top = `╭${"─".repeat(innerWidth)}╮`;
    const bottom = `╰${"─".repeat(innerWidth)}╯`;
    const body = lines.map(line => `│ ${padVisible(line, innerWidth - 1)}│`);
    return [top, ...body, bottom].join("\n");
}

// ============================================================================
// SCAFFOLD TEMPLATES
// ============================================================================
const projectHello =
`import std.io.println;

fx main(): i32 {
    println("Hello World");
    return 0;
}`;

const libraryHello =
`pub fx add(i32 a, i32 b): i32 {
    return a + b;
}`;

const projectToml = (name: string) =>
`[project]
name = "${name}"
version = "1.0.0"

[packages]
std = "1.0.0"`;

const libraryToml = (name: string) =>
`[library]
name = "${name}"
version = "1.0.0"

[packages]`;

// ============================================================================
// CREATE FUNCTION
// ============================================================================
function create(what: "library" | "project", name: string): void {
    const folderPath = path.resolve(name);

    if (fs.existsSync(folderPath)) {
        log(
            Log.Error,
            "Scaffold",
            `${what} '${name}' already exists`,
            `Remove or rename the existing '${name}' directory and try again.`
        );
        process.exit(1);
    }

    fs.mkdirSync(folderPath, { recursive: true });

    if (what === "project") {
        fs.writeFileSync(path.join(folderPath, "main.bx"), projectHello);
        fs.writeFileSync(path.join(folderPath, "project.toml"), projectToml(name));
    } else {
        fs.writeFileSync(path.join(folderPath, "lib.bx"), libraryHello);
        fs.writeFileSync(path.join(folderPath, "library.toml"), libraryToml(name));
    }

    log(
        Log.Info,
        "Scaffold",
        `${what} '${name}' created successfully`,
        `cd ${name} to get started.`
    );
}

// ============================================================================
// CLI CORE INTERFACES
// ============================================================================
interface CommandContext {
    args: string[];
    options: Record<string, boolean | string>;
}

interface CommandConfig {
    name: string;
    description: string;
    usage: string;
    category?: string;
    aliases?: string[];
    action: (ctx: CommandContext) => void | Promise<void>;
}

// ============================================================================
// COMMAND REGISTRY
// ============================================================================
const commands: Record<string, CommandConfig> = {
    help: {
        name: "help",
        description: "Displays the help manual, layout mappings, and current versions",
        usage: `${CLI_CONFIG.name} help`,
        category: "General",
        action: () => displayHelp()
    },
    new: {
        name: "new",
        description: "Initializes a structured template workspace or micro-library",
        usage: `${CLI_CONFIG.name} new <name> [--project | --library]`,
        category: "Scaffolding",
        action: (ctx) => {
            const name = ctx.args[0];
            if (!name) {
                log(Log.Error, "CLI", "Argument Required", `Provide a name: '${CLI_CONFIG.name} new my-app'`);
                return;
            }
            const type = ctx.options["--library"] ? "library" : "project";
            create(type, name);
        }
    },
    run: {
        name: "run",
        description: "Spins up local development server with full code hot-reloading",
        usage: `${CLI_CONFIG.name} run`,
        category: "Development",
        aliases: ["dev"],
        action: () => {
            log(Log.Info, "Runner", "Starting local instance...", "Listening on http://localhost:3000");
        }
    },
    build: {
        name: "build",
        description: "Bundles, tree-shakes, and optimizes assets for production distribution",
        usage: `${CLI_CONFIG.name} build`,
        category: "Development",
        action: () => {
            log(Log.Info, "Compiler", "Compiling assets...", "Minifying logic trees down to production-ready chunks.");
        }
    }
};

// ============================================================================
// HELP INTERFACE DISPLAY
// ============================================================================
function formatCommandUsage(cmd: CommandConfig): string {
    const usageParts = cmd.usage.split(" ");
    const commandCall = `${usageParts[0]} ${usageParts[1] ?? ""}`.trim();
    const params = usageParts.slice(2).join(" ");
    const aliasNote = cmd.aliases?.length
        ? ` ${THEME.dim}(alias: ${cmd.aliases.join(", ")})${THEME.reset}`
        : "";
    return `${THEME.success}${commandCall}${THEME.reset} ${THEME.dim}${params}${THEME.reset}${aliasNote}`;
}

function groupByCategory(): Record<string, CommandConfig[]> {
    const grouped: Record<string, CommandConfig[]> = {};
    for (const key in commands) {
        const cmd = commands[key];
        const category = cmd.category ?? "General";
        (grouped[category] ??= []).push(cmd);
    }
    return grouped;
}

function displayHelp(): void {
    const { bold, dim, muted, reset } = THEME;

    console.log("\n" + box([
        `${bold}● ${gradientText(CLI_CONFIG.name.toUpperCase(), THEME.accent)}${reset}  ${dim}v${CLI_CONFIG.version}${reset}`,
        `${muted}${CLI_CONFIG.tagline}${reset}`
    ]) + "\n");

    console.log(`${bold}Usage${reset}`);
    console.log(`  ${dim}$${reset} ${CLI_CONFIG.name} <command> [arguments] [options]\n`);

    const grouped = groupByCategory();
    const columnWidth = Math.max(
        ...Object.values(commands).map(cmd => visibleLength(formatCommandUsage(cmd)))
    ) + 3;

    for (const [category, cmds] of Object.entries(grouped)) {
        console.log(`${bold}${muted}${category}${reset}`);
        for (const cmd of cmds) {
            const usage = padVisible(formatCommandUsage(cmd), columnWidth);
            console.log(`  ${usage}${cmd.description}`);
        }
        console.log("");
    }

    console.log(`${dim}Run any command to start. Use flags like --library to shift outputs.${reset}\n`);
}

// ============================================================================
// SUGGESTION ENGINE
// ============================================================================
function levenshtein(a: string, b: string): number {
    const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[a.length][b.length];
}

function closestCommand(input: string): string | null {
    let best: { name: string; distance: number } | null = null;
    for (const key in commands) {
        const distance = levenshtein(input, key);
        if (distance <= 2 && (!best || distance < best.distance)) {
            best = { name: key, distance };
        }
    }
    return best?.name ?? null;
}

// ============================================================================
// COMMAND RESOLUTION
// ============================================================================
function resolveCommand(name: string): CommandConfig | undefined {
    if (commands[name]) return commands[name];
    for (const key in commands) {
        if (commands[key].aliases?.includes(name)) return commands[key];
    }
    return undefined;
}

// ============================================================================
// CLI PARSER ENGINE
// ============================================================================
function runCLI(rawArgs: string[]): void {
    const cleanArgs = rawArgs.slice(2);
    const commandName = cleanArgs[0] || "help";

    if (commandName === "--version" || commandName === "-v") {
        console.log(`${CLI_CONFIG.name} v${CLI_CONFIG.version}`);
        return;
    }

    const command = resolveCommand(commandName);

    if (!command) {
        const suggestion = closestCommand(commandName);
        const hint = suggestion
            ? `Did you mean '${THEME.success}${suggestion}${THEME.reset}'? Or run '${CLI_CONFIG.name} help'.`
            : `Type '${CLI_CONFIG.name} help' for routing details.`;
        log(Log.Error, "CLI", `Command not found: '${commandName}'`, hint);
        return;
    }

    const remainingTokens = cleanArgs.slice(1);
    const args: string[] = [];
    const options: Record<string, boolean | string> = {};

    for (const token of remainingTokens) {
        if (token.startsWith("-")) {
            options[token] = true;
        } else {
            args.push(token);
        }
    }

    try {
        command.action({ args, options });
    } catch (err: any) {
        log(Log.Error, "Runtime", `Command execution halted`, err.message || String(err));
    }
}

// Fire CLI Execution
runCLI(Bun.argv);