# Zero-Cost Substitution

## Overview

Zero-Cost Substitution is a compile-time language feature that allows a syntax node to be given a meaningful name without introducing a runtime construct.

Unlike `let`, which creates a value, a substitution creates a **compile-time alias**. Every use of the alias is expanded into the original syntax during compilation.

Substitutions operate on the language's syntax tree rather than performing textual replacement. This allows the compiler to preserve the grammatical structure and semantics of the surrounding program.

The feature improves readability while producing identical generated code to writing the original syntax inline.

---

# Motivation

As programs grow, expressions and statements often become large enough that their intent is obscured by their implementation.

Consider the following condition:

```bx
if (
    player.health > 0 &&
    player.connected &&
    !player.banned &&
    player.hasSpawned
) {
    ...
}
```

While perfectly valid, repeating this condition throughout a function quickly reduces readability.

Zero-Cost Substitution allows the condition to be given a meaningful name without introducing a variable or any runtime abstraction.

```bx
sub player.health > 0 &&
    player.connected &&
    !player.banned &&
    player.hasSpawned
for canPlay;

if (canPlay) {
    ...
}
```

The generated program is identical to writing the original condition directly.

---

# Syntax

```bx
sub <syntax> for <identifier>;
```

Where `<syntax>` may be:

* an expression
* a statement
* any other syntax node recognized by the compiler

---

# Semantics

A substitution defines a compile-time alias for a syntax node.

Whenever the substituted identifier is encountered, the compiler expands it into the substituted syntax before semantic analysis and code generation.

Substitutions are **syntax-level transformations**, not textual replacements.

---

# Expansion Rules

## Expression Expansion

When the substituted syntax is an expression, the compiler replaces the identifier with the substituted expression enclosed in parentheses.

For example,

```bx
sub x + y for sum;

let doubled = sum * 2;
```

expands to

```bx
let doubled = (x + y) * 2;
```

Likewise,

```bx
sub x + y for sum;

foo(sum);
```

expands to

```bx
foo((x + y));
```

and

```bx
sub ptr != null for exists;

if (exists && ready) {
    ...
}
```

expands to

```bx
if ((ptr != null) && ready) {
    ...
}
```

Only the substituted expression is enclosed in parentheses.

This guarantees that operator precedence and evaluation order are preserved.

---

## Statement Expansion

When the substituted syntax is a statement, the compiler replaces the statement body.

Statement terminators remain the responsibility of the use site.

For example,

```bx
sub log("Starting application") for startupLog;

startupLog;
```

expands to

```bx
log("Starting application");
```

The semicolon is **not** considered part of the substitution.

---

## General Rule

Conceptually, substitution behaves as though the compiler performs the following transformation:

```
identifier
        ↓
(grouped substituted syntax)
```

For expressions, grouping is performed using parentheses.

For all other syntax nodes, grouping follows the natural structure defined by the grammar.

---

# Runtime Cost

Substitutions have **zero runtime cost**.

They do not introduce:

* variables
* storage
* memory allocation
* temporaries
* loads
* stores
* function calls

The generated code is identical to writing the expanded syntax directly.

---

# Examples

## Boolean Expressions

```bx
sub age >= 18 for isAdult;

if (isAdult) {
    ...
}
```

expands to

```bx
if ((age >= 18)) {
    ...
}
```

---

## Arithmetic Expressions

```bx
sub width * height for area;

print(area);
```

expands to

```bx
print((width * height));
```

---

## Function Calls

```bx
sub width * height * bytesPerPixel for bufferSize;

allocate(bufferSize);
copy(destination, source, bufferSize);
```

expands to

```bx
allocate((width * height * bytesPerPixel));

copy(
    destination,
    source,
    (width * height * bytesPerPixel)
);
```

---

## Operator Precedence

```bx
sub x + y for sum;

let value = sum * 2;
```

expands to

```bx
let value = (x + y) * 2;
```

never

```bx
let value = x + y * 2;
```

---

## Statement Substitution

```bx
sub cleanup(resources) for cleanupResources;

cleanupResources;
```

expands to

```bx
cleanup(resources);
```

---

# Scope

Substitutions obey normal lexical scoping rules.

```bx
{
    sub x + y for sum;

    print(sum);
}
```

Outside the scope, `sum` is undefined.

Nested scopes may shadow substitutions according to the standard identifier resolution rules.

---

# Name Resolution

Substitutions participate in ordinary identifier lookup.

Declaring multiple symbols with the same identifier within the same scope is invalid.

```bx
sub x > 10 for valid;

let valid = true; // Error
```

---

# Supported Syntax

A substitution aliases compiler syntax.

Valid substitutions include:

* Expressions
* Statements
* Any other syntax node supported by the compiler

The compiler determines whether a substituted node is valid in the location where it is expanded.

For example:

* Expression substitutions may only appear where expressions are valid.
* Statement substitutions may only appear where statements are valid.

---

# Side Effects

Every occurrence of a substitution expands independently.

```bx
sub counter++ for next;

print(next);
print(next);
```

expands to

```bx
print((counter++));
print((counter++));
```

Substitutions do not cache values or introduce temporary storage.

Each expansion behaves exactly as if the substituted syntax had been written inline.

---

# Comparison with Variables

A variable stores the result of evaluating an expression.

```bx
let isAdult = age >= 18;
```

A substitution stores nothing.

```bx
sub age >= 18 for isAdult;
```

Instead, every occurrence of `isAdult` is replaced by the grouped expression `(age >= 18)` during compilation.

| Feature                  |  `let`  | `sub` |
| ------------------------ | :-----: | :---: |
| Creates storage          |    ✓    |   ✗   |
| Exists at runtime        |    ✓    |   ✗   |
| Represents a value       |    ✓    |   ✗   |
| Represents syntax        |    ✗    |   ✓   |
| Can be assigned          |    ✓    |   ✗   |
| Expanded at compile time |    ✗    |   ✓   |
| Zero runtime cost        | Depends |   ✓   |

---

# Comparison with Inline Syntax

Writing

```bx
if (age >= 18) {
    ...
}
```

and

```bx
sub age >= 18 for isAdult;

if (isAdult) {
    ...
}
```

produce identical generated code.

The substitution exists solely to improve readability by assigning a meaningful name to existing syntax.

---

# Implementation Notes

A compiler may implement substitutions as an early syntax transformation.

Each substituted identifier is replaced by its associated syntax node before semantic analysis.

Expression substitutions are enclosed in parentheses during expansion to preserve operator precedence.

After expansion, the compiler proceeds as though the programmer had written the expanded syntax directly.

Because substitutions are eliminated before code generation, they require no runtime representation and no backend support.

---

# Design Goals

Zero-Cost Substitution is designed to:

* Improve readability of complex code.
* Reduce repetition without introducing runtime abstractions.
* Preserve operator precedence automatically.
* Produce identical generated code to inline syntax.
* Remain simple and predictable.
* Avoid the complexity of a general macro system.

A substitution is **not**:

* a variable,
* a value,
* a runtime object,
* a textual macro.

It is a compile-time alias for syntax that expands into the original syntax while preserving its semantics and incurring zero runtime overhead.