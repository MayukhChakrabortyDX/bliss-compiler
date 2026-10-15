#!/usr/bin/env bun

import { stat } from "node:fs/promises";
import { join, relative, dirname, basename, extname } from "node:path";
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
const BUILD_DATE = "15.10.26";
const AUTHOR = "Mayukh Chakraborty";
const WEBSITE = "https://bliss-compiler.vercel.app/";
const SOURCE_EXT = ".bx";

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
    console.log(`    ${color(GREEN, "bliss")} ${dim("<input_folder>")} ${color(YELLOW, "--bulk")} ${dim("[-o <output_folder>]")}`);
    console.log();

    console.log(`  ${bold(color(WHITE, "Examples"))}`);
    console.log(`    ${color(GREEN, "bliss")} main.bx`);
    console.log(`    ${color(GREEN, "bliss")} main.bx -o build/main.json`);
    console.log(`    ${color(GREEN, "bliss")} tests ${color(YELLOW, "--bulk")}`);
    console.log(`    ${color(GREEN, "bliss")} tests ${color(YELLOW, "--bulk")} -o build/tests`);
    console.log();

    console.log(`  ${bold(color(WHITE, "Flags"))}`);
    const FLAG_COL_WIDTH = 24;
    const flagRow = (flag: string, arg: string | undefined, desc: string): void => {
        const plainLen = flag.length + (arg ? arg.length + 1 : 0);
        const pad = " ".repeat(Math.max(FLAG_COL_WIDTH - plainLen, 2));
        console.log(
            `    ${color(YELLOW, flag)}` +
            `${arg ? " " + dim(arg) : ""}` +
            `${pad}${desc}`
        );
    };

    flagRow("-o, --output", "<path>", "Write AST JSON to a specific file (or folder with --bulk)");
    flagRow("-b, --bulk", undefined, `Compile every ${SOURCE_EXT} file in a folder (recursive)`);
    flagRow("-h, --help", undefined, "Show this message");
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
    bulk: boolean;
    help: boolean;
}

function parseArgs(argv: string[]): CliArgs {
    const args: CliArgs = { help: false, bulk: false };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === "-h" || arg === "--help") {
            args.help = true;
            continue;
        }

        if (arg === "-b" || arg === "--bulk") {
            args.bulk = true;
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
/*  Core: compile a single file                                        */
/* ------------------------------------------------------------------ */

interface CompileResult {
    ok: boolean;
    tokenCount: number;
    errorCount: number;
    elapsedMs: number;
}

/**
 * Compiles one file. Never calls process.exit, so it can be reused for
 * single-file and bulk modes. When `verbose` is true, prints step-by-step
 * progress; errors and diagnostics are always printed.
 */
async function compileFile(
    inputPath: string,
    outputPath: string,
    verbose: boolean
): Promise<CompileResult> {
    const startedAt = performance.now();
    const result: CompileResult = { ok: false, tokenCount: 0, errorCount: 0, elapsedMs: 0 };
    const finish = (): CompileResult => {
        result.elapsedMs = performance.now() - startedAt;
        return result;
    };

    const file = Bun.file(inputPath);

    let source: string;
    try {
        source = await file.text();
        if (verbose) success("Read source file", inputPath);
    } catch (err) {
        failure("Failed to read source file", String(err));
        return finish();
    }

    if (verbose) step("Tokenizing", inputPath);
    const tokenizer = new Tokenizer(source);

    try {
        tokenizer.tokenize();
    } catch (err) {
        failure("Tokenizer crashed", String(err));
        return finish();
    }

    const tokens = tokenizer.tokens;
    result.tokenCount = tokens.length;
    if (verbose) success("Tokenized", `${tokens.length} tokens`);

    if (verbose) step("Parsing");
    const parser = new Parser(tokens, tokenizer.sourceContainer);

    let output: unknown;
    try {
        output = parser.parseProgramProduction(inputPath);
    } catch (err) {
        failure("Parser crashed", String(err));
        return finish();
    }

    const diagnostics = parser.diagnostics ?? [];
    const errorCount = diagnostics.length;
    result.errorCount = errorCount;

    if (errorCount > 0) {
        if (verbose) sectionRule("DIAGNOSTICS");
        parser.print();

        warn(
            `${errorCount} ${errorCount === 1 ? "error" : "errors"} found`,
            "compilation halted"
        );
        console.log();
        return finish();
    }

    if (verbose) success("Parsed", "0 errors");

    try {
        if (verbose) step("Writing AST", outputPath);
        await Bun.write(outputPath, JSON.stringify(output, null, 2)); // creates parent dirs
        if (verbose) success("Wrote AST", outputPath);
    } catch (err) {
        failure("Failed to write AST", String(err));
        return finish();
    }

    result.ok = true;
    return finish();
}

/* ------------------------------------------------------------------ */
/*  Single-file mode                                                   */
/* ------------------------------------------------------------------ */

async function runSingle(args: CliArgs): Promise<void> {
    const inputPath = args.inputFile!;
    const outputPath = deriveOutputPath(inputPath, args.outputFile);

    const exists = await Bun.file(inputPath).exists();

    if (!exists) {
        console.log();
        failure(`Cannot find file`, inputPath);
        console.log();
        process.exit(1);
    }

    sectionRule("BLISS COMPILER");

    const result = await compileFile(inputPath, outputPath, true);

    if (!result.ok) {
        process.exit(1);
    }

    console.log();
    console.log(
        `  ${bold(color(GREEN, "No errors."))} ` +
        `${dim(`Compiled in ${result.elapsedMs.toFixed(1)}ms`)}`
    );
    console.log();
}

/* ------------------------------------------------------------------ */
/*  Bulk mode                                                          */
/* ------------------------------------------------------------------ */

async function isDirectory(path: string): Promise<boolean> {
    try {
        return (await stat(path)).isDirectory();
    } catch {
        return false;
    }
}

async function runBulk(args: CliArgs): Promise<void> {
    const inputDir = args.inputFile!;
    const outputDir = args.outputFile; // optional: mirrors input structure

    if (!(await isDirectory(inputDir))) {
        console.log();
        failure("Cannot find folder", inputDir);
        console.log();
        process.exit(1);
    }

    // Collect all .bx files (recursive), sorted for stable output.
    const glob = new Bun.Glob(`**/*${SOURCE_EXT}`);
    const relPaths: string[] = [];
    for await (const rel of glob.scan({ cwd: inputDir, onlyFiles: true })) {
        relPaths.push(rel);
    }
    relPaths.sort();

    sectionRule("BLISS COMPILER · BULK");

    if (relPaths.length === 0) {
        warn(`No ${SOURCE_EXT} files found`, inputDir);
        console.log();
        process.exit(1);
    }

    step(
        `Found ${relPaths.length} ${SOURCE_EXT} ${relPaths.length === 1 ? "file" : "files"}`,
        inputDir
    );
    if (outputDir) step("Output folder", outputDir);
    console.log();

    const startedAt = performance.now();
    const failed: string[] = [];
    let totalTokens = 0;

    for (const rel of relPaths) {
        const inputPath = join(inputDir, rel);

        // With -o: mirror the relative structure inside the output folder.
        // Without -o: write the .json next to each source file.
        const base = basename(rel, extname(rel));
        const outputPath = outputDir
            ? join(outputDir, dirname(rel), `${base}.json`)
            : deriveOutputPath(inputPath);

        const result = await compileFile(inputPath, outputPath, false);
        totalTokens += result.tokenCount;

        const label = relative(inputDir, inputPath) || rel;
        if (result.ok) {
            success(
                label,
                `${result.tokenCount} tokens · ${result.elapsedMs.toFixed(1)}ms`
            );
        } else {
            failure(
                label,
                result.errorCount > 0
                    ? `${result.errorCount} ${result.errorCount === 1 ? "error" : "errors"}`
                    : "failed"
            );
            failed.push(label);
        }
    }

    const elapsed = (performance.now() - startedAt).toFixed(1);
    const passed = relPaths.length - failed.length;

    sectionRule("SUMMARY");

    console.log(
        `  ${color(GREEN, `${passed} passed`)}` +
        `${dim(" · ")}` +
        `${failed.length > 0 ? color(RED, `${failed.length} failed`) : dim("0 failed")}` +
        `${dim(" · ")}` +
        `${dim(`${relPaths.length} total`)}`
    );

    if (failed.length > 0) {
        console.log();
        console.log(`  ${bold(color(WHITE, "Failed files"))}`);
        for (const f of failed) {
            console.log(`    ${color(RED, "✕")} ${f}`);
        }
    }

    console.log();
    console.log(
        `  ${failed.length === 0 ? bold(color(GREEN, "No errors.")) : bold(color(RED, "Completed with errors."))} ` +
        `${dim(`${totalTokens} tokens, compiled in ${elapsed}ms`)}`
    );
    console.log();

    process.exit(failed.length > 0 ? 1 : 0);
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

    if (args.bulk) {
        await runBulk(args);
    } else {
        await runSingle(args);
    }
}

main();