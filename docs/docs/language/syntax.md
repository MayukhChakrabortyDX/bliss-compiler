---
title: Language Syntax
description: Lexical conventions and top-level structure in Bliss.
---

# Language Syntax

## Source files

A Bliss source file is a sequence of top-level declarations. The current program grammar is:

```ebnf
PROGRAM ->
    (IMPORT | USING | FUNCTION | DAOP | ALLOCATOR)*
;
```

Empty files are syntactically valid, and the grammar does not require an entry-point function.

## Comments

Line comments begin with `//` and continue to the end of the line. Comments are handled by the lexer rather than by the grammar productions.

```bliss
// The parser receives the declarations after comments are removed.
fx main(): u32 {
    return 0;
}
```

## Identifiers and literals

Identifiers name functions, values, modules, fields, allocators, and other language entities. Expressions can contain integer literals, real literals, strings, identifiers, and grouped nodes.

```bliss
count
total_items
42
3.14
"hello"
```

## Delimiters

Bliss uses braces for bodies, parentheses for grouping and argument lists, brackets for array forms and access, angle brackets for allocator names, and semicolons to terminate body nodes and declarations.

```bliss
fx add(u32 left, u32 right): u32 {
    left + right;
}
```

The grammar sources are organized under `language/implemented/` and `language/progress/` in the repository.