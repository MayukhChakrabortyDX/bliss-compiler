---
title: Language & Compiler Specifications
description: Formal specifications, grammar standards, memory models, and type invariants for Bliss.
---

# Bliss Specifications

This section documents the formal design specifications, grammar rules, memory guarantees, and type invariants that govern the Bliss programming language and its reference compiler.

While the [Language Guide](/docs/language/) introduces language syntax and programming patterns, the **Specifications** serve as the authoritative standard for compiler implementation, formal verification, and language evolution.

---

## Specification Areas

The Bliss specification is partitioned into three primary technical domains:

1. [**Formal Grammar & EBNF**](/docs/specifications/grammar)  
   Lexical tokenization, operator precedence, grammar productions, and syntax synchronization bounds.

2. [**Memory Model & Pointer Capabilities**](/docs/specifications/memory)  
   The three-tier pointer model, lexical ownership invariants, stack-confined temporary values, and Point of Failure (POF) runtime observability.

3. [**Type System & Invariants**](/docs/specifications/types)  
   Primitive scalar representations, algebraic sum types (discriminated unions), structural records, and exhaustiveness checking.

---

## Stability & Evolution

Specifications progress through three stability tiers:

| Tier | Status | Description |
| :--- | :--- | :--- |
| **Draft** | In Active RFC | Open to syntax shifts, semantic adjustments, and exploratory syntax designs. |
| **Candidate** | Implementation Sync | Core grammar locked; reference parser and middle-end lowering in synchronization. |
| **Formal** | Frozen Standard | Backward-compatible guarantees protected across compiler releases. |
