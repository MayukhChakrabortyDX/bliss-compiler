---
title: Loops AST & Grammar
description: Syntactic specification, AST node structure, and formal grammar for Bliss loop constructs.
---

# Loops AST & Grammar

This specification formalizes the AST node contract, formal grammar production, and analyzer boundaries for **Loop** constructs in the Bliss language parser.

---

## 1. Parser Architecture & Span Tracking

* **Source File:** `compiler/parser/rules/loop.ts`
* **Parser Production:** `parseLoop(parser, sync)`
* **Span Tracking:** The parser captures a start checkpoint via `const finish = parser.start()`, consumes the keyword `loop`, an optional label, and the loop body block, then returns `finish(new Loop(...))` to encapsulate the entire source range.

---

## 2. AST Node Definition

The `Loop` node extends `ParseNode` with kind `ParseNodeEnum.Loop`:

```ts
export class Loop extends ParseNode<ParseNodeEnum.Loop> {
    constructor(
        public name: string,
        public body: ParseNode<ParseNodeEnum.BlockBody>
    ) {
        super(ParseNodeEnum.Loop)
    }
}
```

### Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Optional identifier label assigned to the loop (empty string `""` if anonymous/unlabeled). |
| `body` | `ParseNode<ParseNodeEnum.BlockBody>` | The parsed block body containing statements and expressions. |
| `span` | `{ start: number, end: number }` | Source byte offset bounds starting at keyword `loop` through closing `}`. |
| `kind` | `ParseNodeEnum.Loop` | Discriminator enum tag. |

---

## 3. Formal Grammar

The parser recognizes loop statements according to the following EBNF production:

```ebnf
LOOP -> "loop" @IDENTIFIER? BODY ;
```

Where:
- `@IDENTIFIER` represents an optional labeled target name for nested control-flow breaks and continues.
- `BODY` represents a standard braced block `{ STATEMENT* }`.

---

## 4. Parsing vs. Semantic Analysis Boundaries

* **Parser Responsibility:**  
  Matches the keyword `loop`, consumes an optional label `@IDENTIFIER` (e.g., `loop outer { ... }`), and consumes the enclosed block body via `parseBody`. The parser enforces syntax recovery around delimiters without resolving identifier scopes.
* **AST Analyzer Responsibility:**  
  Resolves label scopes for target jumps (`break outer`, `continue outer`), detects infinite loops, and analyzes control-flow exit conditions.
