---
title: Allocator AST & Grammar
description: Syntactic specification, AST node structure, and formal grammar for Bliss custom memory allocators.
---

# Allocator AST & Grammar

This specification formalizes the AST node contract and grammar production for **Allocator** declarations in the Bliss language parser.

---

## AST Node Definition

The `Allocator` node extends `ParseNode` with kind `ParseNodeEnum.Allocator`:

```ts
export class Allocator extends ParseNode {
    constructor(public name: string, public functions: ParseNode[]) {
        super(ParseNodeEnum.Allocator)
    }
}
```

### Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The identifier name assigned to this custom allocator. |
| `functions` | `ParseNode[]` | The list of function parse nodes declared within the allocator's body block. |
| `span` | `{ start: number, end: number }` | Inherited from `ParseNode`. Encapsulates the entire allocator declaration from the `allocator` keyword to the closing `}`. |
| `kind` | `ParseNodeEnum.Allocator` | Discriminator tag identifying this node as an allocator declaration. |

---

## Formal Grammar

The parser recognizes allocator declarations according to the following production rule:

```ebnf
ALLOCATOR -> 
    "allocator" @IDENTIFIER '{'

        // refer language/function
        function.FUNCTION*

        // technically, we only need the allocate and deallocate portions (or handlers basically)
        // And I think the AST analyzer is much better suited for that.

    '}'
;
```

---

## Parsing vs. Semantic Analysis Boundaries

A core principle of Bliss AST stabilization is keeping the parser purely focused on structural grammar:

1. **Parser Responsibility**  
   The parser checks that the declaration starts with the `allocator` keyword, is followed by a valid `@IDENTIFIER`, and encloses a block of standard function declarations (`function.FUNCTION*`). It constructs an `Allocator` node containing those functions without inspecting their signatures or names.

2. **AST Analyzer Responsibility**  
   Technically, custom allocators only require valid `allocate` and `deallocate` handler functions. However, enforcing these handler constraints at parse time complicates grammar rules and reduces parser error-recovery resilience. Instead, the **AST analyzer** inspects the resulting `functions` array to verify:
   - Presence of a valid `allocate` handler.
   - Presence of a valid `deallocate` handler.
   - Conformance of memory layouts and capability signatures.
