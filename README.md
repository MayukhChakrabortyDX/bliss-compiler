<p align="center">
  <a href="https://bliss-compiler.vercel.app/" target="_blank">
    <img src="builds/icon.png" width="128" height="128" alt="Bliss Programming Language Logo" style="border-radius: 24px;" />
  </a>
</p>

<h1 align="center">The Bliss Programming Language</h1>

<p align="center">
  <strong>An experimental systems programming language exploring Data-Action Oriented Programming (DAOP), explicit memory semantics, and direct lowering to standard C.</strong>
</p>

<p align="center">
  <a href="https://github.com/MayukhChakrabortyDX/bliss-compiler/releases"><img src="https://img.shields.io/github/v/release/MayukhChakrabortyDX/bliss-compiler?style=flat-square&color=6366f1&label=release" alt="Release" /></a>
  <a href="https://github.com/MayukhChakrabortyDX/bliss-compiler/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/MayukhChakrabortyDX/bliss-compiler/ci.yml?style=flat-square&label=build" alt="CI Build Status" /></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/runtime-Bun-fbf0df?style=flat-square&logo=bun&logoColor=black" alt="Bun" /></a>
  <a href="https://en.wikipedia.org/wiki/C99"><img src="https://img.shields.io/badge/target-ANSI%20C%20(C99%2FC11)-00599C?style=flat-square&logo=c&logoColor=white" alt="Target C" /></a>
  <a href="#"><img src="https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-3f3f46?style=flat-square" alt="Platforms" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-10b981?style=flat-square" alt="License: MIT" /></a>
</p>

<p align="center">
  <a href="https://bliss-compiler.vercel.app/">Website</a> &bull;
  <a href="#overview">Overview</a> &bull;
  <a href="#data-action-oriented-programming-daop">DAOP Paradigm</a> &bull;
  <a href="#syntax-and-examples">Syntax & Examples</a> &bull;
  <a href="#getting-started">Getting Started</a> &bull;
  <a href="#cli-usage">CLI Usage</a> &bull;
  <a href="#compiler-architecture">Architecture</a> &bull;
  <a href="#project-status-and-roadmap">Roadmap</a> &bull;
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

## Overview

Bliss is an experimental systems programming language designed from first principles. Rather than bundling state, interfaces, and methods into monolithic class hierarchies or relying entirely on unconstrained procedural idioms, Bliss investigates **Data-Action Oriented Programming (DAOP)**.

In DAOP, physical memory layouts (`data`), interface specifications (`action`), and concrete associations (`bind`) remain cleanly decoupled. Bliss code compiles directly to portable ANSI C (C99/C11), offering transparent low-level control, predictable memory representation, and direct interoperability with existing C toolchains.

### Core Design Goals

- **Structural Decoupling**: Separation of memory representation (`data`) from behavioral contracts (`action`).
- **Explicit Semantics**: Systems operations and memory modifiers (`let (unsafe)`, `let (trans)`, `let (const)`) make intent visible without hidden compiler transformations.
- **Custom Allocator Model**: First-class language constructs for custom memory allocators (`allocator`, `new`, `free`).
- **Standard C Lowering**: Emits standard C, allowing programs to leverage existing C optimizers (GCC, Clang, MSVC), debuggers, and system ABIs.
- **Standalone Binary Distribution**: The compiler compiles into a zero-dependency native executable for Linux, Windows, and macOS.

---

## Data-Action Oriented Programming (DAOP)

Traditional object-oriented languages tightly couple physical state and behavioral dispatch inside classes, frequently introducing runtime costs such as vtables, object layout restrictions, and rigid inheritance trees.

Bliss separates these concerns into three distinct declarations:

```mermaid
flowchart LR
    Data["data (Memory Representation)<br/>Defines struct fields and memory layouts"] --> Bind["bind Data with Action as Association<br/>Explicitly binds state to behavior"]
    Action["action (Behavioral Interface)<br/>Defines function signatures"] --> Bind
    Bind --> Target["Generated Systems Code<br/>Lowers to standard C types and functions"]
```

1. **`data`**: Declares concrete memory layouts (records, primitives, pointers, and array buffers).
2. **`action`**: Declares behavioral capabilities (function signatures).
3. **`bind`**: Explicitly binds a data type to an action contract under a named association.

---

## Syntax and Examples

### 1. Data, Action, and Binding

```bliss
// Define the memory layout
data Vector2D {
    data x: i32;
    data y: i32;
}

// Define the interface contract
action Scalable {
    fx scale(data factor: i32): void;
}

// Explicitly bind the data type to the action
bind Vector2D with Scalable as VectorMath {
    fx scale(data factor: i32): void {
        x = x * factor;
        y = y * factor;
    }
}
```

### 2. Explicit Systems Modifiers

For low-level memory interactions, Bliss requires explicit qualifiers at declaration sites:

```bliss
data Node {
    data val: i32;
    data next: [Node];
}

fx createNode(data val: i32): [Node] {
    let (unsafe) node: [Node] = malloc(sizeof Node);
    node.val = val;
    node.next = node;
    return node;
}
```

### 3. Custom Memory Allocator Grammar

```bliss
allocator Arena {
    fx allocate(data size: u64): [u8];
    fx reset(): void;
}
```

### 4. Generated C Output

Bliss lowers top-level declarations directly into ANSI C (C99/C11):

<table>
<tr>
<th>Bliss Source (<code>point.bx</code>)</th>
<th>Generated C (<code>point.c</code>)</th>
</tr>
<tr>
<td>

```bliss
data Point {
    data x: i32;
    data y: i32;
}

fx render(data p: i32) {
}
```

</td>
<td>

```c
#include <stdint.h>

typedef struct {
    int32_t x;
    int32_t y;
} Point;

void render(int32_t p) {}
```

</td>
</tr>
</table>

---

## Getting Started

### Pre-compiled Standalone Binaries

Self-contained binaries are built for every release and available on the [GitHub Releases](https://github.com/MayukhChakrabortyDX/bliss-compiler/releases) page:

| Operating System | Target Architecture | Binary Name |
| :--- | :--- | :--- |
| **Linux** | x86_64, ARM64 | `bliss-linux-x64`, `bliss-linux-arm64` |
| **Windows** | x86_64, ARM64 | `bliss-windows-x64.exe`, `bliss-windows-arm64.exe` |
| **macOS** | Apple Silicon (ARM64) | `bliss-macos-arm64` |

On Unix systems, grant execution permission after downloading:

```bash
chmod +x bliss-linux-x64
mv bliss-linux-x64 /usr/local/bin/bliss
```

### Building From Source

The compiler is developed in TypeScript and runs on [Bun](https://bun.sh/).

```bash
# Clone the repository
git clone https://github.com/MayukhChakrabortyDX/bliss-compiler.git
cd bliss-compiler

# Install development dependencies
bun install

# Compile the standalone native binary
bun run build:alpha

# The output executable is placed at dist/builds/bliss (or bliss.exe on Windows)
```

---

## CLI Usage

The Bliss CLI driver supports single-file compilation, automated output path resolution, and batch processing:

```bash
# Compile a single file to C (creates input.c alongside input.bx)
bliss input.bx

# Compile a file with explicit output destination
bliss input.bx -o build/output.c

# Bulk-compile all .bx files within a directory
bliss tests --bulk -o build/tests
```

### Command Flags

| Flag | Argument | Description |
| :--- | :--- | :--- |
| `-o, --output` | `<path>` | Specify destination `.c` file or output folder (when using `--bulk`) |
| `-b, --bulk` | _none_ | Recursively compile all `.bx` source files in the input path |
| `-h, --help` | _none_ | Display usage information and compiler version |

### Diagnostic Output

The compiler uses source-span tracking to produce clear terminal diagnostics when syntax or semantic errors occur:

```text
error: Expected the keyword data
  ╭─▶ line 2, column 5
  │
1 │ data Node {
2 │     i32 val;
  │     ^^^ Got keyword i32
3 │     [Node] next;
  │
  ╰─ help: In Bliss, declare fields using 'data <name>: <type>;'
```

---

## Compiler Architecture

The compiler is structured as a pipeline of distinct phases:

```mermaid
flowchart TD
    subgraph Frontend["1. Lexing & Parsing"]
        Source[".bx Source File"] --> Lexer["Tokenizer<br/>(compiler/lexer)"]
        Lexer --> Tokens["Token Stream & Spans"]
        Tokens --> Parser["Combinator Parser<br/>(compiler/parser)"]
        Parser --> AST["Abstract Syntax Tree (AST)"]
    end

    subgraph Semantic["2. Semantic Analysis"]
        AST --> Analyzer["Semantic Analyzer<br/>(compiler/analyzer)"]
        Analyzer --> Diagnostic["Diagnostics & Type Resolution"]
    end

    subgraph Backend["3. Lowering & C Emission"]
        Diagnostic --> Lowering["Lowering Engine<br/>(compiler/lowering)"]
        Lowering --> CFile["ANSI C Code (.c)"]
    end

    subgraph Binary["4. Native Toolchain"]
        CFile --> CC["GCC / Clang / MSVC"]
        CC --> Executable["Native Executable / Shared Library"]
    end
```

- **`compiler/lexer/`**: Tokenizer with precise source span tracking, keyword matching, and string scanning.
- **`compiler/parser/`**: Production combinator parser implementing grammar rules for DAOP, functions, loops, and types.
- **`compiler/analyzer/`**: Symbol table validation, diagnostic reporting, and type verification.
- **`compiler/lowering/`**: Maps Bliss AST structures into portable ANSI C code.
- **`builds/`**: CLI runtime entry point with diagnostic formatting and batch compilation routines.

---

## Test Suite

The repository includes a suite of 350+ `.bx` programs under `tests/` validating language constructs, edge cases, and parser stability:

```bash
# Run the test suite against the compiler
bun run test

# Compile an individual test file
bun run compile tests/daop_018_bind_single_action.bx
```

---

## Project Status and Roadmap

Bliss is currently in active pre-alpha development. The current focus is completing expression-level lowering and control flow emission to C.

- [x] Tokenizer with source span tracking and comment handling
- [x] Combinator-based recursive descent parser
- [x] Grammar specifications for DAOP (`data`, `action`, `bind`)
- [x] Source-referenced diagnostic rendering
- [x] ANSI C code generation for top-level data structures and function signatures
- [x] Cross-platform build automation via GitHub Actions (Linux, Windows, macOS)
- [ ] Statement and expression lowering (`loop`, `if`, arithmetic, assignments)
- [ ] Static method call resolution for bindings
- [ ] Allocator runtime implementation and lowering
- [ ] Initial standard library modules (`std.io`, `std.mem`)
- [ ] Syntax highlighting definitions for text editors

---

## Contributing

Contributions, bug reports, and design discussions are welcome. Please refer to:

- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Architecture guide, local development workflow, and coding conventions.
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)**: Community standards and participation guidelines.
- **[SECURITY.md](SECURITY.md)**: Vulnerability reporting guidelines.

---

## License

Bliss is open-source software licensed under the [MIT License](LICENSE).  
Copyright &copy; 2026 **Mayukh Chakraborty**.
