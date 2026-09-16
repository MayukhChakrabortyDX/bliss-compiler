---
title: Statements and Control Flow
description: Functions, bodies, bindings, loops, and conditions in Bliss.
---

# Statements and Control Flow

## Functions

Functions use `fx`, typed arguments, a required return type, and a braced body:

```bliss
fx add(u32 left, u32 right): u32 {
    left + right;
}
```

Function bodies contain nested structures or semicolon-terminated nodes:

```bliss
fx example(u32 value): u32 {
    let result: u32 = value + 1;
    result;
}
```

Arguments may carry a `with` action annotation:

```bliss
fx process(u32 value with (fast, safe)): u32 {
    value;
}
```

## Statements

The current statement grammar includes `return`, `break`, `let`, `transform`, and `sub`:

```bliss
return value;
break;
break outer;
let value: u32 = 42;
transform value to result: u32;
sub old with new;
```

`let` supports the current modifier-list syntax:

```bliss
let (unsafe, trans) value: u32 = 42;
```

## Conditions

Conditions use `if`, `elif`, and `else` blocks. Their condition is a node:

```bliss
if (value > 0) {
    value;
} elif (value == 0) {
    0;
} else {
    return 0;
}
```

## Loops

Loops may be named, which gives `break` an optional target:

```bliss
loop outer {
    loop inner {
        break outer;
    }
}
```

The grammar sources are `language/implemented/function.blang`, `language/implemented/conditional.blang`, and `language/implemented/loop.blang`.