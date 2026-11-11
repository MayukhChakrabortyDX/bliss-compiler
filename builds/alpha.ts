#!/usr/bin/env bun

import { Analyzer } from "../compiler/analyzer"
import { Tokenizer } from "../compiler/lexer/tokenizer"
import { TokenType } from "../compiler/lexer/tokens"
import { lowerProgram } from "../compiler/lowering/program"
import { Parser } from "../compiler/parser/parser"
import { program, ProgramNode } from "../compiler/parser/rules/program"
import { union } from "../compiler/parser/api/union"

import { stat } from "node:fs/promises";
import { join, relative, dirname, basename, extname } from "node:path";

/* ------------------------------------------------------------------ */
/*  The compiler core (unchanged)                                      */
/* ------------------------------------------------------------------ */

function compile(sourceCode: string): string {

    const tokenizer = new Tokenizer(sourceCode)
    tokenizer.tokenize()
    const parser = new Parser(tokenizer.tokens, tokenizer.sourceContainer)
    const ast = (program.execute(parser, union(TokenType.EOF)) as ProgramNode)
    
    ast.span.end = tokenizer.tokens[tokenizer.tokens.length - 1]?.span.endIndex || 0
    
    parser.print()
    
    const analyzer = new Analyzer(ast, tokenizer.sourceContainer)
    analyzer.analyzeProgram(ast)
    analyzer.print()
    
    const output = lowerProgram(ast)
    return output //is a string

}

/* ------------------------------------------------------------------ */
/*  Diagnostic counting                                                */
/*                                                                     */
/*  compile() prints diagnostics but doesn't report how many there     */
/*  were. Rather than change it, we wrap the two print() methods so    */
/*  the CLI can count errors and refuse to write output for a program  */
/*  that had any.                                                      */
/* ------------------------------------------------------------------ */

let pendingErrors = 0;

const originalParserPrint = Parser.prototype.print;
Parser.prototype.print = function (this: Parser) {
    pendingErrors += this.diagnostics?.length ?? 0;
    clearLine(); // wipe the "› file" progress line before diagnostics appear
    originalParserPrint.call(this);
};

const originalAnalyzerPrint = Analyzer.prototype.print;
Analyzer.prototype.print = function (this: Analyzer) {
    pendingErrors += this.diagnostics?.length ?? 0;
    clearLine();
    originalAnalyzerPrint.call(this);
};

/* ------------------------------------------------------------------ */
/*  Small ANSI helpers (no external deps, just Bun + node stdlib)      */
/* ------------------------------------------------------------------ */

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const WHITE = "\x1b[37m";
const GRAY = "\x1b[90m";

const color = (code: string, text: string) => `${code}${text}${RESET}`;
const bold = (text: string) => color(BOLD, text);
const dim = (text: string) => color(DIM, text);

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

const VERSION = "Pre-Alpha";
const BUILD_DATE = "9.11.26";
const AUTHOR = "Mayukh Chakraborty";
const WEBSITE = "https://bliss-compiler.vercel.app/";
const SOURCE_EXT = ".bx";
const OUTPUT_EXT = ".c";
const DEFAULT_BULK_OUT = "build";

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
    console.log(`    ${color(GREEN, "bliss")} ${dim(`<file${SOURCE_EXT}>`)} ${dim(`[-o <output${OUTPUT_EXT}>]`)}`);
    console.log(`    ${color(GREEN, "bliss")} ${dim("<input_folder>")} ${color(YELLOW, "--bulk")} ${dim("[-o <output_folder>]")}`);
    console.log();

    console.log(`  ${bold(color(WHITE, "Examples"))}`);
    console.log(`    ${color(GREEN, "bliss")} main${SOURCE_EXT}`);
    console.log(`    ${color(GREEN, "bliss")} main${SOURCE_EXT} -o build/main${OUTPUT_EXT}`);
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

    flagRow("-o, --output", "<path>", "Output file (or output folder with --bulk)");
    flagRow("-b, --bulk", undefined, `Compile every ${SOURCE_EXT} file in a folder (default output: <folder>/${DEFAULT_BULK_OUT})`);
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

const IS_TTY = Boolean(process.stdout.isTTY);

/** Clears an in-progress "› file" line (TTY only). */
function clearLine(): void {
    if (IS_TTY) process.stdout.write("\x1b[2K\r");
}

/** Shows which file is currently compiling, so a hang is easy to spot. */
function showProgress(label: string): void {
    if (IS_TTY) process.stdout.write(`  ${color(BLUE, "›")} ${label}`);
}

function failure(label: string, detail?: string): void {
    clearLine();
    console.log(
        `  ${color(RED, "✕")} ${label}` +
        (detail ? ` ${dim(detail)}` : "")
    );
}

function warn(label: string, detail?: string): void {
    clearLine();
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

/** foo/bar.bx -> foo/bar.c (unless an explicit output was given). */
function deriveOutputPath(inputPath: string, explicitOutput?: string): string {
    if (explicitOutput) {
        return explicitOutput;
    }

    const dir = dirname(inputPath);
    const base = basename(inputPath, extname(inputPath));

    return join(dir, `${base}${OUTPUT_EXT}`);
}

/* ------------------------------------------------------------------ */
/*  Core: compile a single file                                        */
/* ------------------------------------------------------------------ */

interface CompileResult {
    ok: boolean;
    errorCount: number;
    outputBytes: number;
    elapsedMs: number;
}

/**
 * Compiles one file. Never calls process.exit, so it can be reused for
 * single-file and bulk modes. When `verbose` is true, prints step-by-step
 * progress; diagnostics are always printed (by compile() itself).
 */
async function compileFile(
    inputPath: string,
    outputPath: string,
    verbose: boolean
): Promise<CompileResult> {
    const startedAt = performance.now();
    const result: CompileResult = { ok: false, errorCount: 0, outputBytes: 0, elapsedMs: 0 };
    const finish = (): CompileResult => {
        result.elapsedMs = performance.now() - startedAt;
        return result;
    };

    let source: string;
    try {
        source = await Bun.file(inputPath).text();
        if (verbose) success("Read source file", inputPath);
    } catch (err) {
        failure("Failed to read source file", String(err));
        return finish();
    }

    if (verbose) step("Compiling", inputPath);

    pendingErrors = 0;
    let output: string;
    try {
        output = compile(source);
    } catch (err) {
        failure("Compiler crashed", String(err));
        result.errorCount = pendingErrors;
        return finish();
    }

    result.errorCount = pendingErrors;

    if (result.errorCount > 0) {
        warn(
            `${result.errorCount} ${result.errorCount === 1 ? "error" : "errors"} found`,
            "compilation halted"
        );
        console.log();
        return finish();
    }

    if (verbose) success("Compiled", "0 errors");

    try {
        if (verbose) step("Writing C output", outputPath);
        await Bun.write(outputPath, output); // creates parent dirs
        result.outputBytes = Buffer.byteLength(output);
        if (verbose) success("Wrote C output", outputPath);
    } catch (err) {
        failure("Failed to write output", String(err));
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

    if (!(await Bun.file(inputPath).exists())) {
        console.log();
        failure("Cannot find file", inputPath);
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
        `${dim(`${result.outputBytes} bytes of C in ${result.elapsedMs.toFixed(1)}ms`)}`
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
    // Bulk output is always a folder (mirrors the input structure).
    // Defaults to <input_folder>/build when -o is not given.
    const outputDir = args.outputFile ?? join(inputDir, DEFAULT_BULK_OUT);

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
        const parts = rel.split(/[\\/]/);
        if (parts.includes("node_modules")) continue;
        // Don't recompile anything inside the output folder.
        if (parts[0] === DEFAULT_BULK_OUT && args.outputFile === undefined) continue;
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
    step("Output folder", outputDir);
    console.log();

    const startedAt = performance.now();
    const failed: string[] = [];
    let totalBytes = 0;

    for (const rel of relPaths) {
        const inputPath = join(inputDir, rel);

        const base = basename(rel, extname(rel));
        const outputPath = join(outputDir, dirname(rel), `${base}${OUTPUT_EXT}`);

        const label = relative(inputDir, inputPath) || rel;
        showProgress(label);

        const result = await compileFile(inputPath, outputPath, false);
        totalBytes += result.outputBytes;
        clearLine();

        if (result.ok) {
            success(label, `${result.outputBytes} bytes · ${result.elapsedMs.toFixed(1)}ms`);
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
        `${dim(`${totalBytes} bytes of C, compiled in ${elapsed}ms`)}`
    );
    console.log();

    process.exit(failed.length > 0 ? 1 : 0);
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
    const args = parseArgs(Bun.argv.slice(2));

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