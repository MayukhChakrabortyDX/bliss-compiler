---
title: Operator Expressions AST & Grammar
description: Syntactic specification, operator precedence parsing, and AST nodes for Bliss binary and unary expressions.
---

# Operator Expressions AST & Grammar

This specification formalizes the AST node structures, precedence climbing models, and analyzer boundaries for **Binary** and **Unary Operator Expressions** in the Bliss language parser.

---

## 1. Subsystem Overview & Status

* **Source File:** `compiler/parser/rules/node.ts`
* **Migration Status:** **Partially Migrated**
* **Precedence Parsing:** Binary expressions are resolved using precedence climbing. Operators construct formal `BinaryOperator` or `UnaryOperator` instances wrapped in `parser.start()` / `finish(...)` span bounds.

---

## 2. AST Node Definitions

Operator expressions are represented by two generic `ParseNode` classifications:

```ts
export class BinaryOperator<T extends BinaryOperatorEnum> extends ParseNode<ParseNodeEnum.BinaryOperator> {
    constructor(public operator: T, public left: any, public right: any) {
        super(ParseNodeEnum.BinaryOperator)
    }
}

export class UnaryOperator<T extends UnaryOperatorEnum> extends ParseNode<ParseNodeEnum.UnaryOperator> {
    constructor(public operator: T, public over: any) {
        super(ParseNodeEnum.UnaryOperator)
    }
}
```

### Properties

| Class | Property | Type | Description |
| :--- | :--- | :--- | :--- |
| `BinaryOperator` | `operator` | `BinaryOperatorEnum` | Operator tag (`Sum`, `Product`, `Equality`, `Access`, `Assignment`, etc.). |
| `BinaryOperator` | `left` | `any` | Left-hand expression operand node. |
| `BinaryOperator` | `right` | `any` | Right-hand expression operand node. |
| `UnaryOperator` | `operator` | `UnaryOperatorEnum` | Unary operator tag (`Deref`, `AddressOf`, `Negate`, `Not`). |
| `UnaryOperator` | `over` | `any` | Target operand expression being modified. |
| Both | `span` | `{ start: number, end: number }` | Source token span from start of left operand/unary operator through end of right operand. |
| Both | `kind` | `ParseNodeEnum` | Discriminator tag: `BinaryOperator` or `UnaryOperator`. |

---

## 3. Current Migration State for Expressions

* **Stabilized Rules:**
  - Binary precedence climbing algorithms for arithmetic (`+`, `-`, `*`, `/`), logical/bitwise comparisons (`==`, `!=`, `<`, `>`, `<=`, `>=`), assignment (`=`), and member accesses (`.`, `->`) construct `BinaryOperator` instances wrapped in `finish(...)`.
  - Prefix unary operators (`-`, `!`, `*`, `&`) construct `UnaryOperator` instances wrapped in `finish(...)`.
* **Pending Migration in `node.ts`:**
  - Primary atoms (identifiers, integer/float/string literals), function invocations (`call`), and indexed accesses currently return ad-hoc plain objects or raw tokens instead of dedicated `ParseNode` instances.

---

## 4. Parsing vs. Semantic Analysis Boundaries

* **Parser Responsibility:**  
  Executes operator precedence climbing, groups binary and unary subtrees according to associativity rules, and captures precise source spans across multi-token expressions.
* **AST Analyzer Responsibility:**  
  - Type-checks left and right operand compatibility.
  - Verifies operator overload implementations or built-in primitive validity.
  - Checks l-value mutability for assignment operators (`=`).
  - Resolves field member offsets and struct dereferencing for access operators (`.`, `->`).
