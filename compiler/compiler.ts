
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Tokenizer } from "./lexer/tokenizer";
import { Parser } from "./parser/parser";
import { Analyzer } from "./analyzer";
import { program, ProgramNode } from "./parser/rules/program";
import { union } from "./parser/api/union";
import { TokenType } from "./lexer/tokens";
import { lowerProgram } from "./lowering/program";

// Responsible for building a Bliss project
export async function build_project(root_path: string) {

    const root = path.resolve(root_path);

    const projectFile = path.join(root, "project.toml");
    const entryFile = path.join(root, ".dev", "entry.c");
    const mainFile = path.join(root, "src", "main.bx");

    if (!existsSync(projectFile)) {
        console.log("Not a valid project path!");
        process.exit(1);
    }

    if (!existsSync(entryFile)) {
        console.log("This is not a valid project / malformed project. Please create it again");
        process.exit(1);
    }

    if (!existsSync(mainFile)) {
        console.log("A project must have main.bx file in the source folder!");
        process.exit(1);
    }

    // Read the main.bx file
    const source = readFileSync(mainFile, "utf-8");

    const tokenizer = new Tokenizer(source);
    tokenizer.tokenize()

    const parser = new Parser(tokenizer.tokens, tokenizer.sourceContainer);

    const node = program.execute(parser, union(TokenType.EOF)) as ProgramNode;

    node.span.end = tokenizer.tokens[tokenizer.tokens.length - 1]?.span.endIndex || 0;

    const analyzer = new Analyzer(
        node,
        tokenizer.sourceContainer
    );

    analyzer.analyzeProgram(node)

    parser.print();
    analyzer.print();

    if (parser.diagnostics.length !== 0 || analyzer.diagnostics.length !== 0) {
        console.log("Compilation halted due to errors");
        process.exit(1);
    }

    // Lower Bliss AST into C
    const code = lowerProgram(node);

    const depsDir = path.join(root, ".dev", "deps");
    const buildDir = path.join(root, "build");

    mkdirSync(depsDir, { recursive: true });
    mkdirSync(buildDir, { recursive: true });

    const generatedFile = path.join(depsDir, "main.c");
    const outputFile = path.join(buildDir, "dist.exe");

    writeFileSync(generatedFile, code, "utf-8");

    // Invoke the C compiler
    try {
        const proc = Bun.spawn(
            [
                "zig", "cc",
                generatedFile,
                entryFile,
                "-o", outputFile
            ],
            {
                cwd: root,
                stdout: "pipe",
                stderr: "pipe"
            }
        );

        const [exitCode, stdout, stderr] = await Promise.all([
            proc.exited,
            new Response(proc.stdout).text(),
            new Response(proc.stderr).text()
        ]);

        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);

        if (exitCode !== 0) {
            console.log(`Compilation failed with exit code ${exitCode}`);
            process.exit(1);
        }

        console.log(`Build successful: ${outputFile}`);

    } catch (error) {
        console.error("Failed to invoke Zig C compiler:", error);
        process.exit(1);
    }
}
