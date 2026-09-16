---
title: The Bliss Language
description: A language-only guide to Bliss syntax, declarations, expressions, and current implementation status.
---

# The Bliss Language

Bliss is a systems programming language being designed alongside its parser. This section is the language reference: it describes the syntax currently represented by the grammar files under `language/implemented/` and clearly labels features that are still in progress.

## Start here

| Page | Purpose |
| --- | --- |
| [Syntax](./syntax) | Source files, comments, program structure, and grammar conventions. |
| [Types](./types) | Built-in, composite, pointer-like, reference-like, and array forms. |
| [Expressions](./expressions) | Expression atoms, operators, access, calls, and precedence. |
| [Statements and control flow](./statements) | Functions, bodies, bindings, returns, loops, and conditions. |
| [Modules and declarations](./modules) | Imports, using declarations, allocators, and experimental DAOP forms. |
| [Language status](./status) | What is implemented, in progress, tested, or still semantic design. |

## What this section promises

This documentation is syntax-first. A construct appearing here means that it is described by the language grammar; it does not automatically mean that the parser integrates it, that the AST preserves it, or that semantic analysis accepts it.

The current language sources are the closest thing to a canonical specification:

- `language/implemented/` contains the established grammar fragments.
- `language/progress/` contains grammar that is being integrated or revised.
- `language/proposals/` is reserved for designs that are not part of the current grammar.

## A small program

```bliss
import std.io;

fx main(): u32 {
    return 0;
}
```

The grammar does not require a `main` function. It is a conventional example and may become a tooling convention later.

## Syntax versus meaning

The parser recognizes structure. Later language work will decide questions such as whether a name exists, whether a type is valid, whether an assignment is legal, and what allocation or modifier operations mean. Examples in this section should therefore be read as syntactic examples unless a page says otherwise.