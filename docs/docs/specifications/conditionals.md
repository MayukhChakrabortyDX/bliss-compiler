---
title: Conditionals AST & Grammar
description: Syntactic specification, AST branch nodes, and formal grammar for Bliss conditional statements.
---

# Conditionals AST & Grammar

This specification formalizes the AST node contracts, formal grammar productions, and analyzer boundaries for **Conditional** branching (`if`, `elif`, `else`) in the Bliss language parser.

---

## 1. Parser Architecture & Span Tracking

* **Source File:** `compiler/parser/rules/condition.ts`
* **Parser Production:** `parseCondition(parser, sync): IfBranch | ElifBranch | ElseBranch`
* **Span Tracking:** Each branch independently activates a start checkpoint via `const finish = parser.start()` and returns `finish(new ...Branch(...))` to capture precise source offset ranges from the branch keyword to the closing `}`.

---

## 2. AST Node Definitions

Conditionals are represented by three specialized `ParseNode` classifications:

```ts
export class IfBranch extends ParseNode<ParseNodeEnum.IfBranch> {
    constructor(public condition: ParseNode<any>, public body: ParseNode<any>) {
        super(ParseNodeEnum.IfBranch)
    }
}

export class ElifBranch extends ParseNode<ParseNodeEnum.ElifBranch> {
    constructor(public condition: ParseNode<any>, public body: ParseNode<any>) {
        super(ParseNodeEnum.ElifBranch)
    }
}

export class ElseBranch extends ParseNode<ParseNodeEnum.ElseBranch> {
    constructor(public body: ParseNode<any>) {
        super(ParseNodeEnum.ElseBranch)
    }
}
```

### Properties

| Class | Property | Type | Description |
| :--- | :--- | :--- | :--- |
| `IfBranch` / `ElifBranch` | `condition` | `ParseNode<any>` | The conditional test expression enclosed within `(` and `)`. |
| `IfBranch` / `ElifBranch` | `body` | `ParseNode<any>` | The statement block executed when the condition evaluates to true. |
| `ElseBranch` | `body` | `ParseNode<any>` | The fallback statement block. |
| All Branches | `span` | `{ start: number, end: number }` | Source token span from branch keyword (`if`, `elif`, `else`) to block closing `}`. |
| All Branches | `kind` | `ParseNodeEnum` | Discriminator tag: `IfBranch`, `ElifBranch`, or `ElseBranch`. |

---

## 3. Formal Grammar

The parser recognizes conditional branches according to the following EBNF productions:

```ebnf
IF_BRANCH   -> "if" '(' NODE ')' BODY ;
ELIF_BRANCH -> "elif" '(' NODE ')' BODY ;
ELSE_BRANCH -> "else" BODY ;

CONDITION   -> IF_BRANCH | ELIF_BRANCH | ELSE_BRANCH ;
```

---

## 4. Parsing vs. Semantic Analysis Boundaries

* **Parser Responsibility:**  
  Parses individual conditional branches atomically with synchronization recovery points around `(`, `)`, and `{}`. The parser preserves the raw syntactic branch sequence without enforcing relationship topologies.
* **AST Analyzer Responsibility:**  
  Verifies branching topology (ensuring `elif` and `else` only follow a valid `if`/`elif` sequence), checks boolean coercibility of the `condition` expressions, and determines exhaustive branch returns.
