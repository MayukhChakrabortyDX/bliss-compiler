import { Parser } from "../modules/compiler/parser/parser";
import { Tokenizer } from "../modules/compiler/tokenizer/tokenizer";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

const PROGRAMS_DIR = path.join("tests", "programs");
const OUTPUT_DIR = path.join(PROGRAMS_DIR, "output");

function ensureOutputDir() {
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }
}

function main() {
    const fileName = process.argv[2];
    if (!fileName) {
        console.error("Usage: bun run tests/suite.test.ts <fileName>");
        process.exit(1);
    }

    ensureOutputDir();

    const filePath = path.join(PROGRAMS_DIR, fileName);
    const source = readFileSync(filePath, "utf8");

    const tokenizer = new Tokenizer(source);
    tokenizer.tokenize();

    const parser = new Parser(tokenizer.tokens, tokenizer.sourceContainer);
    const ast = parser.parseProgram();

    const programName = path.basename(fileName, path.extname(fileName));
    const outputPath = path.join(OUTPUT_DIR, `${programName}.json`);

    const json = JSON.stringify(ast, null, 2);
    writeFileSync(outputPath, json, "utf8");

    console.log(`\n=== ${programName} ===`);
    //console.log(json);
    console.log(`--> written to ${outputPath}`);
}

main();