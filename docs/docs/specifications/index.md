---
title: AST Stabilization Overview
description: Formal parser AST contract, ParseTree structure, migration status matrix, and specifications overview for the Bliss compiler.
---

# AST Stabilization: Overview

This specification establishes the formal syntactic contract for the Bliss compiler front-end. The goal of AST stabilization is to freeze and formalize the data structures produced during syntactic analysis before code enters semantic inspection and middle-end lowering.

---

## 1. The Core Parser Contract

The front-end parser operates under a direct and predictable rule:

> **The parser generates a `ParseTree`, consisting exclusively of `ParseNode` instances.**

The parser is strictly focused on **syntactic validity**. It constructs the concrete parse tree faithfully without attempting to perform semantic type-checking, handler validation, or ownership verification. Those responsibilities are explicitly deferred to the downstream AST analyzer.

---

## 2. Base `ParseNode` Specification

Every concrete syntax node produced by the parser inherits from the base `ParseNode` class (`compiler/parser/utility/parse_node.ts`):

```ts
export class ParseNode<T extends ParseNodeEnum = ParseNodeEnum> {

    span = {
        start: 0,
        end: 0
    }

    constructor(public kind: T) {}

    toString() {
        return {
            ...this,
            kind: ParseNodeEnum[this.kind] // so that the JSON output is readable at least
        }
    }
}
```

### Architectural Invariants

1. **Source Spans (`span`)**  
   Every node records its starting and ending character offsets (`start`, `end`) within the source text via `parser.start()`. Spans are preserved throughout transformation pipelines to power high-fidelity error reporting, IDE language server ranges, and formatting tools.

2. **Kind Discrimination (`kind`)**  
   Every node carries a `ParseNodeEnum` tag that uniquely identifies its syntactic classification without requiring expensive runtime prototype checks or `instanceof` cascades.

3. **Human-Readable Diagnostics (`toString`)**  
   To facilitate compiler tooling, testing, and tree debugging, `toString()` serializes the node into an inspectable object where `kind` maps to its readable enum identifier rather than an opaque integer index.

---

## 3. Migration Summary Matrix

The following matrix documents the migration status across all grammar rules and AST structures within `compiler/parser/rules/`:

| Section / Domain | Source File | Status | AST Classes Migrated | Documentation |
| :--- | :--- | :--- | :--- | :--- |
| **Allocator** | `allocator.ts` | **Stabilized** | `Allocator` | [Allocator Specification](/docs/specifications/allocator) |
| **Loops** | `loop.ts` | **Stabilized** | `Loop` | [Loops Specification](/docs/specifications/loops) |
| **Conditionals** | `condition.ts` | **Stabilized** | `IfBranch`, `ElifBranch`, `ElseBranch` | [Conditionals Specification](/docs/specifications/conditionals) |
| **DAOP: Data Layouts** | `daop.ts` | **Stabilized** | `DataLayout`, `DataField` | [DAOP Specification](/docs/specifications/daop) |
| **DAOP: Actions** | `daop.ts` | **Stabilized** | `ActionNode` | [DAOP Specification](/docs/specifications/daop#3-action-contracts) |
| **DAOP: Bindings** | `daop.ts` | **Stabilized** | `DataBinding` | [DAOP Specification](/docs/specifications/daop#4-data-bindings) |
| **DAOP: Aliases** | `daop.ts` | **Stabilized** | `TypeAlias` | [DAOP Specification](/docs/specifications/daop#5-type-aliases) |
| **Program Root** | `program.ts` | **Stabilized** | `Program` | [Program Root Specification](/docs/specifications/program) |
| **Expressions / Binary Ops** | `node.ts` | **Partially Migrated** | `BinaryOperator`, `UnaryOperator` | [Expressions Specification](/docs/specifications/expressions) |
| **Functions** | `function.ts` | **Pending** | Returns plain objects (`{ is: "function" }`) | *In Progress* |
| **Type System** | `types.ts` | **Pending** | Returns plain objects (`{ is: "built-in-type" }`, etc.) | *In Progress* |
| **Modifiers** | `modifiers.ts` | **Pending** | Returns plain objects (`{ is: "modifier" }`) | *In Progress* |
| **Module System** | `module.ts` | **Pending** | Uses legacy `Node` from `ast.ts` | *In Progress* |

---

## 4. Stabilized Specifications Index

Dive deeper into the individual AST specifications:

* [**Allocator AST & Grammar**](/docs/specifications/allocator)  
  Syntactic structure for custom memory allocators, AST node properties, EBNF grammar production, and AST analyzer verification boundaries.

* [**Loops AST & Grammar**](/docs/specifications/loops)  
  Specification for labeled and unlabeled `loop` statements, block body containment, and control-flow jump analysis.

* [**Conditionals AST & Grammar**](/docs/specifications/conditionals)  
  Atomic branch classifications (`IfBranch`, `ElifBranch`, `ElseBranch`), conditional expressions, and branch recovery points.

* [**DAOP AST & Grammar**](/docs/specifications/daop)  
  Complete Data-Action Oriented Programming subsystem: memory layouts (`Token`, `Linear`, `Array`, `Struct`), action behavioral contracts, data bindings, and type aliases.

* [**Program Root AST & Grammar**](/docs/specifications/program)  
  Root compilation unit node, translation unit grammar, source file metadata, and declaration collection.

* [**Operator Expressions AST & Grammar**](/docs/specifications/expressions)  
  Precedence climbing for binary operators, unary prefix expressions, and pending primary atom migrations.

---

## 5. Recommended Migration Roadmap

To complete total AST stabilization across the remaining compiler front-end rules:

1. **`function.ts`**: Create `FunctionNode`, `FunctionHead`, and `FunctionParameter` extending `ParseNode`.
2. **`types.ts`**: Create `BuiltinTypeNode`, `PointerTypeNode`, and `ArrayTypeNode` extending `ParseNode<ParseNodeEnum.DataType>`.
3. **`modifiers.ts`**: Create `ModifierNode` extending `ParseNode`.
4. **`module.ts`**: Replace legacy `Node` imports from `ast.ts` with modern `ParseNode` implementations.
