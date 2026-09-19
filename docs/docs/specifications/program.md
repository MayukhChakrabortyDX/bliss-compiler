---
title: Program Root AST & Grammar
description: Syntactic specification, root AST node structure, and compilation unit grammar for the Bliss compiler.
---

# Program Root AST & Grammar

This specification formalizes the AST node structure, translation unit grammar, and analyzer boundaries for the **Program** root node in the Bliss language parser.

---

## 1. Parser Architecture & Span Tracking

* **Source File:** `compiler/parser/rules/program.ts`
* **Parser Production:** `parseProgramProduction(parser, filename)`
* **Span Tracking:** The root `Program` node encapsulates the entire compilation unit, spanning from character offset 0 through the terminal `EOF` token.

---

## 2. AST Node Definition

The `Program` node extends `ParseNode` with kind `ParseNodeEnum.Program`:

```ts
export class Program extends ParseNode<ParseNodeEnum.Program> {
    constructor(public body: any, public filename: string) {
        super(ParseNodeEnum.Program)
    }
}
```

### Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `filename` | `string` | The source file path or identifier corresponding to this translation unit. |
| `body` | `ParseNode[]` | Ordered collection of top-level declarations parsed until `EOF`. |
| `span` | `{ start: number, end: number }` | Spans from offset 0 through `EOF`. |
| `kind` | `ParseNodeEnum.Program` | Root AST discriminator tag. |

---

## 3. Formal Grammar

The parser recognizes a compilation unit according to the following top-level production:

```ebnf
TOP_LEVEL_DECL -> IMPORT | USING | FUNCTION | ALLOCATOR | DAOP ;
PROGRAM        -> TOP_LEVEL_DECL* EOF ;
```

---

## 4. Parsing vs. Semantic Analysis Boundaries

* **Parser Responsibility:**  
  Sequentially parses top-level declarations (`import`, `using`, functions, allocators, data layouts, bindings, actions), tracks synchronizations across declaration boundaries, and packages the results into the root `Program` node.
* **AST Analyzer Responsibility:**  
  - Builds module symbol tables and validates visibility modifiers (`pub`).
  - Detects duplicate declaration symbols within the same namespace.
  - Resolves cross-file dependency graphs, module imports, and cycles.
  - Directs translation unit lowerings into middle-end intermediate representations.
