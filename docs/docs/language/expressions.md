---
title: Bliss Expressions
description: Expression forms and precedence in Bliss.
---

# Bliss Expressions

Bliss builds expressions from the inside out. The current precedence chain is:

```text
ATOM
  -> array access and calls
  -> :: binding
  -> -> magnetic expression
  -> . access
  -> * /
  -> + -
  -> comparisons
  -> equality
  -> assignment
```

## Atoms and calls

Atoms include identifiers, numbers, strings, grouped nodes, bracket forms, backtick forms, `adrs`, and `sizeof`.

```bliss
value
42
"hello"
(left + right)
[value | size]
#[address | size]
adrs value
sizeof value
```

Calls and array access can repeat after an atom. The current array index grammar accepts an integer token:

```bliss
items[0]
matrix[0][1]
print(value)
combine(left, right)
```

## Structural operators

The language defines several explicit structural operators:

```bliss
object::field
source -> destination
object.field
```

Their syntax is represented by the parser, while their semantic distinction remains under design.

## Arithmetic and comparison

```bliss
a * b + c
a + b * c
a < b
a == b
a != b
```

Multiplication and division bind inside sums. Comparisons are built above sums, followed by equality and assignment.

## Assignment

Assignment is the outer expression layer:

```bliss
value = 42
result = left + right
```

The grammar permits repeated assignment and comparison operators, but semantic rules for those forms are not yet specified.

The authoritative expression productions are in `language/implemented/node.blang`.