---
title: Bliss Types
description: The current syntax for Bliss type expressions.
---

# Bliss Types

Types are composed from a type atom and optional fixed-size suffixes:

```ebnf
TYPE -> TYPE_ATOM ("[" @INTEGER "]")*
```

## Built-in types

The implemented grammar defines unsigned and signed integer types from 8 through 64 bits, plus 32- and 64-bit floating-point types:

```bliss
u8   u16   u32   u64
i8   i16   i32   i64
f32  f64
```

## Type constructors

Type atoms currently include built-ins, composite names, `#` forms, bracket forms, and backtick forms:

```bliss
u32
#u32
[u32]
`u32
Thing::field
```

The exact semantic distinction between these constructors is not finalized. The parser records their shape; semantic analysis will define their validity and runtime behavior.

## Fixed-size suffixes

An integer suffix describes a fixed-size dimension:

```bliss
u8[10]
u8[10][20]
[u32][4]
```

The suffix requires an integer token. `u8[value]` is not the same grammar form as `u8[10]`.

## Typed declarations

Types appear in bindings, function arguments, return types, and transformations:

```bliss
let value: u32 = 42;

fx add(u32 left, u32 right): u32 {
    left + right;
}
```

The grammar source is `language/implemented/types.blang`.