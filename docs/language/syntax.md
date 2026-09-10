---
title: Syntax
description: The syntax and surface structure of Bliss programs.
---

# Syntax

Bliss syntax is intentionally being developed alongside the compiler rather than frozen ahead of implementation.

## Functions

Functions use the `fx` keyword.

```bliss
fx main() {
}
```

## Expressions

Expressions are designed to remain explicit and readable while leaving room for the language's broader programming model.

## Recovery-friendly parsing

The compiler is being designed with structured error recovery as a first-class concern. Syntax should therefore be understandable not only to the programmer, but also to the parser recovering from malformed input.
