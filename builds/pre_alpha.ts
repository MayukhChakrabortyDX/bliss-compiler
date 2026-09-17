#!/usr/bin/env bun

import { Tokenizer } from "../compiler/lexer/tokenizer";
import { Parser } from "../compiler/parser/parser";

/* ------------------------------------------------------------------ */
/*  Small ANSI helpers (no external deps — just Bun + node stdlib)     */
/* ------------------------------------------------------------------ */

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";
const GRAY = "\x1b[90m";

const color = (code: string, text: string) => `${code}${text}${RESET}`;
const bold = (text: string) => color(BOLD, text);
const dim = (text: string) => color(DIM, text);

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

const VERSION = "Pre-Alpha";
const BUILD_DATE = "17.9.26";
const AUTHOR = "Mayukh Chakraborty";
const WEBSITE = "https://bliss-compiler.vercel.app/";

/* ------------------------------------------------------------------ */
/*  Banner                                                             */
/* ------------------------------------------------------------------ */

function printBanner(): void {

    console.log();

    console.log(
        `  ${bold(color(WHITE, `Bliss Compiler ${VERSION} Build`))} ` +
        `${dim(`(${BUILD_DATE})`)}`
    );
    console.log(`  ${dim("Made by")} ${color(MAGENTA, AUTHOR)}`);
    console.log(`  ${dim("Website:")} ${color(BLUE, WEBSITE)}`);
    console.log();

    console.log(`  ${bold(color(WHITE, "Usage"))}`);
    console.log(`    ${color(GREEN, "bliss")} ${dim("<file.bx>")} ${dim("[-o <output.json>]")}`);
    console.log();

    console.log(`  ${bold(color(WHITE, "Examples"))}`);
    console.log(`    ${color(GREEN, "bliss")} main.bx`);
    console.log(`    ${color(GREEN, "bliss")} main.bx -o build/main.json`);
    console.log();

    console.log(`  ${bold(color(WHITE, "Flags"))}`);
    console.log(`    ${color(YELLOW, "-o, --output")}  ${dim("<path>")}   Write AST JSON to a specific file`);
    console.log(`    ${color(YELLOW, "-h, --help")}              Show this message`);
    console.log();
}

/* ------------------------------------------------------------------ */
/*  Step / status rendering                                            */
/* ------------------------------------------------------------------ */

function step(label: string, detail?: string): void {
    console.log(
        `  ${color(BLUE, "›")} ${label}` +
        (detail ? ` ${dim(detail)}` : "")
    );
}

function success(label: string, detail?: string): void {
    console.log(
        `  ${color(GREEN, "✓")} ${label}` +
        (detail ? ` ${dim(detail)}` : "")
    );
}

function failure(label: string, detail?: string): void {
    console.log(
        `  ${color(RED, "✕")} ${label}` +
        (detail ? ` ${dim(detail)}` : "")
    );
}

function warn(label: string, detail?: string): void {
    console.log(
        `  ${color(YELLOW, "⚠")} ${label}` +
        (detail ? ` ${dim(detail)}` : "")
    );
}

function sectionRule(title: string): void {
    const width = 60;
    const label = ` ${title} `;
    const sideLen = Math.max(Math.floor((width - label.length) / 2), 2);
    const side = "─".repeat(sideLen);
    console.log(`\n${color(GRAY, side)}${bold(color(WHITE, label))}${color(GRAY, side)}\n`);
}

/* ------------------------------------------------------------------ */
/*  Arg parsing                                                        */
/* ------------------------------------------------------------------ */

interface CliArgs {
    inputFile?: string;
    outputFile?: string;
    help: boolean;
}

function parseArgs(argv: string[]): CliArgs {
    const args: CliArgs = { help: false };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === "-h" || arg === "--help") {
            args.help = true;
            continue;
        }

        if (arg === "-o" || arg === "--output") {
            args.outputFile = argv[i + 1];
            i++;
            continue;
        }

        if (!(arg as string).startsWith("-") && args.inputFile === undefined) {
            args.inputFile = arg;
            continue;
        }
    }

    return args;
}

function deriveOutputPath(inputPath: string, explicitOutput?: string): string {
    if (explicitOutput) {
        return explicitOutput;
    }

    const lastSlash = Math.max(
        inputPath.lastIndexOf("/"),
        inputPath.lastIndexOf("\\")
    );

    const dir = lastSlash === -1 ? "" : inputPath.substring(0, lastSlash + 1);
    const fileName = lastSlash === -1 ? inputPath : inputPath.substring(lastSlash + 1);

    const dot = fileName.lastIndexOf(".");
    const base = dot === -1 ? fileName : fileName.substring(0, dot);

    return `${dir}${base}.json`;
}

/* ------------------------------------------------------------------ */
/*  Main                                                                */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
    const argv = Bun.argv.slice(2);
    const args = parseArgs(argv);

    if (args.help || !args.inputFile) {
        printBanner();
        process.exit(args.help ? 0 : 1);
    }

    const inputPath = args.inputFile;
    const outputPath = deriveOutputPath(inputPath, args.outputFile);

    const file = Bun.file(inputPath);
    const exists = await file.exists();

    if (!exists) {
        console.log();
        failure(`Cannot find file`, inputPath);
        console.log();
        process.exit(1);
    }

    sectionRule("BLISS COMPILER");

    const startedAt = performance.now();

    let source: string;
    try {
        source = await file.text();
        success("Read source file", inputPath);
    } catch (err) {
        failure("Failed to read source file", String(err));
        process.exit(1);
        return;
    }

    step("Tokenizing", inputPath);
    const tokenizer = new Tokenizer(source);

    try {
        tokenizer.tokenize();
    } catch (err) {
        failure("Tokenizer crashed", String(err));
        process.exit(1);
        return;
    }

    const tokens = tokenizer.tokens;
    success("Tokenized", `${tokens.length} tokens`);

    step("Parsing");
    const parser = new Parser(tokens, tokenizer.sourceContainer);

    let output: unknown;
    try {
        output = parser.parseProgramProduction();
    } catch (err) {
        failure("Parser crashed", String(err));
        process.exit(1);
        return;
    }

    const diagnostics = parser.diagnostics ?? [];
    const errorCount = diagnostics.length;

    if (errorCount > 0) {
        sectionRule("DIAGNOSTICS");
        parser.print();

        warn(
            `${errorCount} ${errorCount === 1 ? "error" : "errors"} found`,
            "compilation halted"
        );
        console.log();
        process.exit(1);
    }

    success("Parsed", "0 errors");

    step("Writing AST", outputPath);
    await Bun.write(outputPath, JSON.stringify(output, null, 2));
    success("Wrote AST", outputPath);

    const elapsed = (performance.now() - startedAt).toFixed(1);

    console.log();
    console.log(
        `  ${bold(color(GREEN, "No errors."))} ` +
        `${dim(`Compiled in ${elapsed}ms`)}`
    );
    console.log();
}

main();