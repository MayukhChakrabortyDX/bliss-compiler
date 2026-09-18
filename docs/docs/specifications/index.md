---
title: AST Stabilization Overview
description: Formal parser AST contract, ParseTree structure, and base ParseNode specifications for the Bliss compiler.
---

# AST Stabilization: Overview

This specification establishes the formal syntactic contract for the Bliss compiler front-end. The goal of AST stabilization is to freeze and formalize the data structures produced during syntactic analysis before code enters semantic inspection and middle-end lowering.

---

## The Core Parser Contract

The front-end parser operates under a direct and predictable rule:

> **The parser generates a `ParseTree`, consisting exclusively of `ParseNode` instances.**

The parser is strictly focused on **syntactic validity**. It constructs the concrete parse tree faithfully without attempting to perform semantic type-checking, handler validation, or ownership verification. Those responsibilities are explicitly deferred to the downstream AST analyzer.

---

## Base `ParseNode` Specification

Every concrete syntax node produced by the parser inherits from the base `ParseNode` class:

```ts
export class ParseNode {

    span = {
        start: 0,
        end: 0
    }

    constructor(public kind: ParseNodeEnum) {}

    toString() {
        
        return {
            ...this,
            kind: ParseNodeEnum[this.kind] // so that the JSON output is readable atleast.
        }
        
    }

}
```

### Key Architectural Invariants

1. **Source Spans (`span`)**  
   Every node records its starting and ending character offsets (`start`, `end`) within the source text. Spans are preserved throughout transformation pipelines to power high-fidelity error reporting, IDE language server ranges, and code formatters.

2. **Kind Discrimination (`kind`)**  
   Every node carries a `ParseNodeEnum` tag that uniquely identifies its syntactic classification without requiring expensive runtime prototype checks or `instanceof` cascades.

3. **Human-Readable Diagnostics (`toString`)**  
   To facilitate compiler tooling, testing, and tree debugging, `toString()` serializes the node into an inspectable object where `kind` maps to its readable enum identifier rather than an opaque integer index.

---

## Stabilized AST Specifications

As AST nodes stabilize, their formal definitions, grammar productions, and analyzer expectations are documented in this section:

* [**Allocator AST & Grammar**](/docs/specifications/allocator)  
  Syntactic structure for custom memory allocators, AST node properties, EBNF grammar production, and AST analyzer verification boundaries.
