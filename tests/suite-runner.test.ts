import { readdirSync, existsSync } from "fs";
import path from "path";
import { spawnSync } from "child_process";

const PROGRAMS_DIR = path.join("tests", "programs");
const RUNNER_SCRIPT = path.join("tests", "suite.test.ts");

function getProgramFiles(): string[] {
    return readdirSync(PROGRAMS_DIR)
        .filter(f => f.endsWith(".bx") || f.endsWith(".bls"))
        .sort();
}

function main() {
    if (!existsSync(PROGRAMS_DIR)) {
        console.error(`No such directory: ${PROGRAMS_DIR}`);
        process.exit(1);
    }

    const files = getProgramFiles();
    if (files.length === 0) {
        console.log(`No .bx/.bls files found in ${PROGRAMS_DIR}`);
        return;
    }

    const results: { file: string; ok: boolean; code: number | null }[] = [];

    for (const file of files) {
        console.log(`\n--- Running ${file} ---`);
        const result = spawnSync("bun", ["run", RUNNER_SCRIPT, file], {
            stdio: "inherit", // stream child's stdout/stderr live
        });

        const ok = result.status === 0;
        results.push({ file, ok, code: result.status });

        if (!ok) {
            console.error(`--- ${file} FAILED (exit code ${result.status}) ---`);
        }
    }

    console.log("\n=== Summary ===");
    for (const r of results) {
        console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.file}${r.ok ? "" : `  (exit ${r.code})`}`);
    }

    const failed = results.filter(r => !r.ok).length;
    console.log(`\n${results.length - failed}/${results.length} succeeded`);

    // Optional: propagate failure to CI without stopping the batch above
    if (failed > 0) process.exitCode = 1;
}

main();