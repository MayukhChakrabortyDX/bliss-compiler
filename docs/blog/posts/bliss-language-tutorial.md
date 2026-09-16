---
title: Bliss Language
description: A practical syntax guide for writing and testing Bliss programs
---

# Bliss Language

This guide is a **syntax-first tutorial for Bliss**.

The goal is simple: give you enough of the language to start writing programs and testing the Bliss parser.

> **Important:** This page describes what the parser can recognize. It does not attempt to define semantic validity. A program can therefore be syntactically valid while being rejected later by semantic analysis.

---

## 1. A Bliss Program

A Bliss source file is a sequence of top-level declarations.

The top-level grammar is:

```ebnf
PROGRAM ->
    (IMPORT | USING | FUNCTION | DAOP | ALLOCATOR)*
;
```

So a program can contain any number of:

- `import` declarations
- `using` declarations
- functions
- DAOP declarations
- allocator declarations

For example:

```bliss
import std.io;
using std;

fx main(): u32 {
    42;
}
```

There is no required `main` function or other mandatory top-level construct in the grammar.

An empty file is also syntactically valid.

---

# 2. Comments

The grammar files use `//` comments, but comments are handled by the lexer rather than by the productions shown here.

Examples in this document may therefore contain comments for explanation:

```bliss
// This is a comment.
fx main(): u32 {
    42;
}
```

---

# 3. Modules

Bliss provides `import` and `using` declarations.

## Import

```bliss
import std;
import std.io;
import std.io.console;
```

The grammar is:

```ebnf
IMPORT ->
    "import" MODULE_PATH ";"
;
```

## Using

```bliss
using std;
using std.io;
using std.io.console;
```

The grammar is:

```ebnf
USING ->
    "using" MODULE_PATH ";"
;
```

## Module paths

A module path is made from module atoms separated by `.`:

```ebnf
MODULE_PATH ->
    MODULE_ATOM ("." MODULE_ATOM)*
;
```

A module atom can be:

```ebnf
MODULE_ATOM ->
    @IDENTIFIER
    | "(" MODULE_PATH ("," MODULE_PATH)* ")"
    | "*"
;
```

Therefore, the following forms are syntactically expressible:

```bliss
std
std.io
std.io.console
*
(foo, bar)
(foo, bar).baz
```

The grammar permits a module path inside another module path, so grouped paths can also be nested:

```bliss
(foo, bar.baz)
```

---

# 4. Types

Types are built from type atoms.

```ebnf
TYPE ->
    TYPE_ATOM ("[" @INTEGER "]")*
;
```

## Built-in types

The built-in type grammar is:

```ebnf
BUILTIN ->
    `${u, i}${8, 16, 32, 64}`
    | `f${32, 64}`
;
```

This gives the following built-in forms:

```bliss
u8
u16
u32
u64

i8
i16
i32
i64

f32
f64
```

## Composite types

A composite type starts with an atom and can be extended using `::`:

```ebnf
COMPOSITE ->
    ATOM ("::"
        "(" (@IDENTIFIER ("," @IDENTIFIER)*) ")"
        | @IDENTIFIER
    )
;
```

Examples:

```bliss
Thing::value
Thing::field::value
Thing::(left, right)
```

The first component is an expression `ATOM`, rather than only an identifier.

For example, because `ATOM` includes parenthesized nodes, the grammar can express forms such as:

```bliss
(foo)::bar
```

## Type atoms

```ebnf
TYPE_ATOM ->
    BUILTIN
    | COMPOSITE
    | "#" TYPE
    | "[" TYPE "]"
    | "`" TYPE
;
```

This means types can be constructed using:

- built-in types
- composite types
- `#` forms
- `[...]` forms
- backtick forms

Examples:

```bliss
u32
`u32
[u32]
#u32
Thing::value
```

## Array-sized type suffixes

Any type atom can be followed by zero or more integer-sized suffixes:

```ebnf
TYPE ->
    TYPE_ATOM ("[" @INTEGER "]")*
;
```

Examples:

```bliss
u8[10]
u8[10][20]
[u32][4]
`u8[16]
```

The suffix contains an integer token:

```bliss
u8[10]
```

not an arbitrary node:

```bliss
u8[value]
```

The latter does not match this production.

---

# 5. Values and Expressions

Expressions in Bliss are built in layers.

The important idea is that a complicated expression is gradually built from simpler expressions.

The expression chain is:

```text
ATOM
  ↓
DecideArrayOrCall
  ↓
BINDING
  ↓
MAGNETIC
  ↓
ACCESS
  ↓
PRODUCT
  ↓
SUM
  ↓
INEQUALITY
  ↓
EQUALITY
  ↓
ASSIGNMENT
```

This gives Bliss its expression syntax.

---

## Numbers

```ebnf
NUMBER ->
    @INTEGER
    | @REAL
;
```

Examples:

```bliss
0
1
42
1000
3.14
0.5
```

---

## Atoms

The base expression production is:

```ebnf
ATOM ->
    @IDENTIFIER
    | NUMBER
    | @STRING
    | "(" NODE ")"
    | "[" NODE ("|" NODE)? "]"
    | "#[" NODE ("|" NODE)? "]"
    | "`" ATOM
    | "adrs" ATOM
    | "sizeof" ATOM
;
```

### Identifiers

```bliss
value
counter
hello
some_name
```

### Strings

```bliss
"hello"
"Bliss"
"some text"
```

### Parenthesized nodes

```bliss
(value)
(a + b)
(a + b) * c
```

The contents are a `NODE`, so parenthesized expressions can contain the full node grammar.

### Bracket forms

```bliss
[value]
[value | size]
```

### Hardware-handle-style bracket forms

```bliss
#[value]
#[address | size]
```

### Backtick form

```bliss
`value
`[value]
`(value)
```

The grammar specifically applies the backtick to an `ATOM`.

### `adrs`

```bliss
adrs value
adrs [value]
adrs (value + 1)
```

### `sizeof`

```bliss
sizeof value
sizeof [value]
sizeof (value + 1)
```

---

# 6. Array Access and Calls

After an atom, Bliss allows repeated array-access or call suffixes.

```ebnf
DecideArrayOrCall ->
    ATOM (
        "[" @INTEGER "]"
        | "(" (NODE ("," NODE)*)? ")"
    )*
;
```

## Array access

The index is specifically an integer token:

```bliss
items[0]
items[1]
items[42]
```

Repeated access is allowed:

```bliss
matrix[0][1]
buffer[10][20][30]
```

An arbitrary expression is **not** the index according to this production:

```bliss
items[index]
items[a + b]
```

These do not match the array-access branch because it requires `@INTEGER`.

## Calls

Calls may have zero or more arguments:

```bliss
foo()
foo(value)
foo(left, right)
foo(a, b, c)
```

Arguments are `NODE`s, so expressions can be passed:

```bliss
foo(a + b)
foo(items[0])
foo((a + b) * c)
```

Calls and array access can be chained:

```bliss
foo()[0]
items[0](value)
foo(a)[0](b)
```

The grammar permits these forms; semantic analysis determines whether the resulting constructs make sense.

---

# 7. Binding

Bindings extend `DecideArrayOrCall` using `::`.

```ebnf
BINDING ->
    DecideArrayOrCall ("::" DecideArrayOrCall)*
;
```

Examples:

```bliss
object::field
object::field::value
foo()::bar
items[0]::value
```

---

# 8. Magnetic Expressions

Magnetic expressions extend bindings using `->`.

```ebnf
MAGNETIC ->
    BINDING ("->" BINDING)*
;
```

Examples:

```bliss
a -> b
source -> destination
a -> b -> c
object::field -> target
```

The grammar allows multiple `->` segments.

---

# 9. Access

Access expressions extend magnetic expressions using `.`.

```ebnf
ACCESS ->
    MAGNETIC ("." MAGNETIC)*
;
```

Examples:

```bliss
object.field
object.field.value
a -> b.c
a.b -> c.d
```

Notice that the right-hand side of `.` is a `MAGNETIC`, not merely an identifier.

---

# 10. Arithmetic

## Product

Multiplication and division are represented by:

```ebnf
PRODUCT ->
    ACCESS (("*" | "/") ACCESS)*
;
```

Examples:

```bliss
a * b
a / b
a * b / c
```

## Sum

Addition and subtraction are represented by:

```ebnf
SUM ->
    PRODUCT (("-" | "+") PRODUCT)*
;
```

Examples:

```bliss
a + b
a - b
a + b * c
a * b + c
```

Because `SUM` is built on `PRODUCT`, multiplication/division expressions form the inner structure before addition/subtraction.

---

# 11. Comparisons

## Inequality

```ebnf
INEQUALITY ->
    SUM (("<" | ">" | "<=" | ">=") SUM)*
;
```

Examples:

```bliss
a < b
a > b
a <= b
a >= b
a + 1 < b * 2
```

## Equality

```ebnf
EQUALITY ->
    INEQUALITY (("==" | "!=") INEQUALITY)*
;
```

Examples:

```bliss
a == b
a != b
a < b == c
```

The grammar permits repeated comparison operators at this level.

---

# 12. Assignment

Assignment is the final expression layer:

```ebnf
ASSIGNMENT ->
    EQUALITY ("=" EQUALITY)*
;
```

Examples:

```bliss
value = 42
a = b
a = b + c
result = a * b
```

The grammar also permits repeated assignment operators:

```bliss
a = b = c
```

Whether such a construction has a meaningful interpretation is outside this syntax guide.

---

# 13. Nodes

`NODE` is the root connector for the expression and statement grammar:

```ebnf
NODE ->
    ASSIGNMENT
    | STATEMENT
    | ALLOCATORS
;
```

This is important when writing bodies.

For example:

```bliss
fx main(): u32 {
    42;
}
```

The `42` is an `ASSIGNMENT`, which is a `NODE`.

A statement is also a node:

```bliss
fx main(): u32 {
    return 42;
}
```

---

# 14. Statements

Bliss currently defines these statement forms:

```ebnf
STATEMENT ->
    RETURN
    | BREAK
    | LET
    | TRANSFORMER
    | SUB
;
```

---

## Return

```ebnf
RETURN ->
    "return" ASSIGNMENT?
;
```

Examples:

```bliss
return;
return value;
return a + b;
return foo(x);
```

The expression after `return` is optional.

---

## Break

```ebnf
BREAK ->
    "break" @IDENTIFIER?
;
```

Examples:

```bliss
break;
break loop_name;
```

The identifier is optional.

---

## Let

```ebnf
LET ->
    "let"
    ("(" MODIFIER ("," MODIFIER)* ")")?
    @IDENTIFIER
    ":"
    TYPE
    "="
    NODE
;
```

Basic form:

```bliss
let value: u32 = 42;
```

With a modifier:

```bliss
let (unsafe) value: u32 = 42;
```

With multiple modifiers:

```bliss
let (unsafe, trans) value: u32 = 42;
```

The initializer is a `NODE`, so it can contain an expression or another statement-shaped node according to the grammar.

---

# 15. Modifiers

The currently defined modifiers are:

```ebnf
MODIFIER ->
    "unsafe"
    | "trans"
    | "volatile"
;
```

They can appear in the modifier list of `let`:

```bliss
let (unsafe) value: u32 = 42;
let (trans) value: u32 = 42;
let (volatile) value: u32 = 42;
let (unsafe, volatile) value: u32 = 42;
```

The grammar requires commas between multiple modifiers.

---

# 16. Transform

The transform statement is:

```ebnf
TRANSFORMER ->
    "transform"
    ASSIGNMENT
    "to"
    @IDENTIFIER
    ":"
    TYPE
;
```

Examples:

```bliss
transform value to result: u32;
transform a + b to result: u32;
transform foo(value) to result: u32;
```

The source portion is an `ASSIGNMENT`.

---

# 17. Substitution

The substitution statement is:

```ebnf
SUB ->
    "sub" NODE "with" NODE
;
```

Examples:

```bliss
sub old with new;
sub value with 42;
sub a + b with c * d;
```

Both sides are `NODE`s.

---

# 18. Memory Allocation

Bliss has two allocation-related node forms.

## New

```ebnf
NEW ->
    "new" "<" @IDENTIFIER ">" ASSIGNMENT
;
```

Example:

```bliss
new<heap> size;
```

The allocator name is an identifier and the following expression is an `ASSIGNMENT`.

## Free

```ebnf
FREE ->
    "free" "<" @IDENTIFIER ">" ASSIGNMENT
;
```

Example:

```bliss
free<heap> ptr;
```

Both forms belong to:

```ebnf
ALLOCATORS ->
    NEW
    | FREE
;
```

---

# 19. Functions

Functions begin with `fx`.

## Typed values

A typed declaration has the form:

```ebnf
TYPED ->
    TYPE @IDENTIFIER
;
```

Examples:

```bliss
u32 value
i64 count
f32 ratio
```

## Function actions

The `with` construct is:

```ebnf
ACTION ->
    "with" (
        "(" @IDENTIFIER ("," @IDENTIFIER)* ")"
        | @IDENTIFIER
    )
;
```

Examples:

```bliss
with fast
with (fast, safe)
with (left, right)
```

A typed declaration can be followed by an action:

```ebnf
COMPOSITE ->
    TYPED ACTION
;
```

For example:

```bliss
u32 value with fast
u32 value with (fast, safe)
```

## Arguments

Function arguments are either `TYPED` or `COMPOSITE`:

```ebnf
ARGS ->
    TYPED
    | COMPOSITE
;
```

A function head is:

```ebnf
HEAD ->
    "fx"
    @IDENTIFIER
    "(" ARGS*[separated_by ','] ")"
    ":"
    TYPE
;
```

Examples:

```bliss
fx main(): u32
fx add(u32 left, u32 right): u32
fx process(u32 value with fast): u32
fx process(u32 value with (fast, safe), i64 count): u64
```

## Function bodies

A function body contains zero or more structures or nodes:

```ebnf
BODY ->
    "{"
        (STRUCTURE | NODE ";")*
    "}"
;
```

A complete function can therefore look like:

```bliss
fx add(u32 left, u32 right): u32 {
    left + right;
}
```

A body may contain several nodes:

```bliss
fx example(u32 value): u32 {
    let result: u32 = value + 1;
    result;
}
```

And structures can appear inside it:

```bliss
fx example(u32 value): u32 {
    loop {
        value;
    }

    value;
}
```

---

# 20. Loops

A loop is a structure:

```ebnf
LOOP ->
    "loop"
    @IDENTIFIER?
    "{"
        (STRUCTURE | NODE ";")*
    "}"
;
```

The loop name is optional.

Unnamed loop:

```bliss
loop {
    value;
}
```

Named loop:

```bliss
loop outer {
    value;
}
```

Loops can contain nodes:

```bliss
loop {
    let value: u32 = 42;
    value;
}
```

They can also contain nested structures:

```bliss
loop outer {
    loop inner {
        value;
    }
}
```

---

# 21. Conditionals

Bliss has three conditional structures.

## If

```ebnf
IF_COND ->
    "if"
    "(" NODE ")"
    "{"
        (STRUCTURE | NODE ";")*
    "}"
;
```

Example:

```bliss
if (value > 10) {
    value;
}
```

The condition is a `NODE`.

That means the grammar allows expressions such as:

```bliss
if (value) {
    value;
}

if (a + b > c) {
    result;
}

if (foo(value)) {
    result;
}
```

## Elif

```ebnf
ELIF_COND ->
    "elif"
    "(" NODE ")"
    "{"
        (STRUCTURE | NODE ";")*
    "}"
;
```

Example:

```bliss
elif (value == 10) {
    value;
}
```

## Else

```ebnf
ELSE_COND ->
    "else"
    "{"
        (STRUCTURE | NODE ";")*
    "}"
;
```

Example:

```bliss
else {
    value;
}
```

## Condition

All three are combined as:

```ebnf
CONDITION ->
    IF_COND
    | ELIF_COND
    | ELSE_COND
;
```

A complete conditional chain can therefore be written as:

```bliss
if (value > 10) {
    value;
}

elif (value == 10) {
    value;
}

else {
    0;
}
```

The grammar treats `if`, `elif`, and `else` as individual `CONDITION` structures. Whether a particular ordering or relationship between them is semantically valid is handled later.

---

# 22. Structures

A structure is a larger construction that contains other language elements.

```ebnf
STRUCTURE ->
    FUNCTION
    | LOOP
    | CONDITION
;
```

Therefore structures include:

- functions
- loops
- conditionals

Structures are important because function and loop bodies are defined in terms of:

```ebnf
STRUCTURE | NODE ";"
```

This is what allows nesting.

For example:

```bliss
fx main(): u32 {
    loop outer {
        if (value > 0) {
            value;
        }

        value;
    }
}
```

---

# 23. DAOP

Bliss defines four DAOP declaration forms:

```ebnf
DAOP ->
    DATA
    | ACTION
    | BIND
    | ALIAS
;
```

---

## Data

There are several syntactic forms of `data`.

### Named data

```ebnf
DATA ->
    "data" @IDENTIFIER ";"
```

Example:

```bliss
data Counter;
```

### Linear data

```ebnf
DATA ->
    "data" @IDENTIFIER "(" TYPE ")" ";"
```

Example:

```bliss
data Counter(u32);
```

### Array data

```ebnf
DATA ->
    "data"
    @IDENTIFIER
    "["
    TYPE
    ","
    INTEGER
    "]"
    ";"
```

Examples:

```bliss
data Buffer[u8, 128];
data Values[i32, 10];
```

The size portion is specifically an integer token.

### Struct-like data

```ebnf
DATA ->
    "data"
    @IDENTIFIER
    "{"
        FIELD (FIELD)*
    "}"
;
```

A field is:

```ebnf
FIELD ->
    TYPE @IDENTIFIER ";"
;
```

Example:

```bliss
data Point {
    i32 x;
    i32 y;
}
```

Another example:

```bliss
data Device {
    u32 address;
    u8 status;
    f32 value;
}
```

---

# 24. Actions

A DAOP action declaration contains function heads.

```ebnf
ACTION ->
    "action"
    @IDENTIFIER
    "{"
        HEAD ";"
        (HEAD ";")*
    "}"
;
```

Example:

```bliss
action Readable {
    fx read(u32 value): u32;
    fx reset(): u32;
}
```

The `HEAD`s end with semicolons because they are declarations rather than function definitions.

---

# 25. Bind

A bind declaration has the form:

```ebnf
BIND ->
    "bind"
    @IDENTIFIER
    "with"
    (
        @IDENTIFIER
        | "(" @IDENTIFIER ("," @IDENTIFIER)* ")"
    )
    "as"
    @IDENTIFIER
    "{"
        FUNCTION (FUNCTION)*
    "}"
;
```

The `with` section can contain one identifier:

```bliss
bind Thing with Display as ThingDisplay {
    fx show(Thing value): u32 {
        value;
    }
}
```

Or multiple identifiers:

```bliss
bind Thing with (Readable, Writable) as ThingIO {
    fx read(Thing value): u32 {
        value;
    }

    fx write(Thing value): u32 {
        value;
    }
}
```

The body contains complete `FUNCTION`s, not function heads.

---

# 26. Aliases

An alias has the form:

```ebnf
ALIAS ->
    "alias" TYPE "as" @IDENTIFIER ";"
;
```

Examples:

```bliss
alias u32 as size;
alias i64 as index;
alias Thing::value as Value;
```

The aliased type is a complete `TYPE`.

---

# 27. Allocators

An allocator declaration has the form:

```ebnf
ALLOCATOR ->
    "allocator"
    @IDENTIFIER
    "{"
        FUNCTION*
    "}"
;
```

Example:

```bliss
allocator heap {
    fx allocate(u32 size): u32 {
        size;
    }

    fx deallocate(u32 ptr): u32 {
        ptr;
    }
}
```

The allocator body contains zero or more complete functions.

For example, an empty allocator is syntactically expressible:

```bliss
allocator empty {
}
```

The grammar itself does not require a particular function to exist.

---

# 28. Putting It Together

Here is a larger syntactic example combining several parts of the language:

```bliss
import std.io;
using std;

data Point {
    i32 x;
    i32 y;
}

action Displayable {
    fx show(Point value): u32;
}

allocator heap {
    fx allocate(u32 size): u32 {
        size;
    }
}

fx calculate(u32 left, u32 right): u32 {
    let result: u32 = left + right;

    if (result > 10) {
        result;
    }

    elif (result == 10) {
        result;
    }

    else {
        result + 1;
    }

    result;
}
```

This example demonstrates:

- module declarations
- a struct-like `data`
- an `action`
- an `allocator`
- a function
- typed parameters
- `let`
- arithmetic
- comparison
- conditional structures
- function bodies
- statement terminators

---

# 29. Parser Testing

If you are testing the Bliss parser, it is useful to start with small programs and progressively combine constructs.

## Minimal programs

```bliss
```

```bliss
fx main(): u32 {
}
```

```bliss
fx main(): u32 {
    42;
}
```

## Expression tests

```bliss
fx test(): u32 {
    1;
    a;
    a + b;
    a * b + c;
    a < b;
    a == b;
    a = b;
}
```

## Call tests

```bliss
fx test(): u32 {
    foo();
    foo(a);
    foo(a, b);
    foo(a + b);
    foo()[0];
}
```

## Nested-expression tests

```bliss
fx test(): u32 {
    (a + b) * c;
    a::b;
    a::b::c;
    a -> b;
    a -> b -> c;
    a.b;
    a.b.c;
}
```

## Statement tests

```bliss
fx test(): u32 {
    return;
    return value;
    break;
    break outer;
    let value: u32 = 42;
    transform value to result: u32;
    sub value with result;
}
```

## Nested structure tests

```bliss
fx test(): u32 {
    loop outer {
        if (value > 0) {
            loop inner {
                value;
            }
        }
    }
}
```

These are particularly useful for testing the parser's handling of nested structures and recovery boundaries.

---

# 30. Syntax vs. Meaning

This document intentionally answers:

> **"Can this sequence of tokens form a Bliss construct?"**

It does not answer:

> **"Does this construct make sense?"**

For example, the grammar can recognize:

```bliss
let value: u32 = "hello";
```

because:

- `let` is valid,
- `value` is an identifier,
- `u32` is a valid type,
- `"hello"` is a valid node.

Whether a string can actually initialize a `u32` is a semantic question.

Similarly, syntax does not establish that:

- an identifier has been declared,
- a type exists,
- a function exists,
- a function can be called with those arguments,
- an allocator exists,
- a pointer operation is valid,
- a `break` target exists,
- a DAOP relationship is valid,
- a type conversion is permitted.

Those belong to later stages of the compiler.

---

# 31. Quick Reference

## Top-level

```text
import
using
fx
data
action
bind
alias
allocator
```

## Types

```text
u8 u16 u32 u64
i8 i16 i32 i64
f32 f64

`
#
[]
::
```

## Expressions

```text
()
[]
#[]
`
adrs
sizeof

::
->
.
*
/
+
-
<
>
<=
>=
==
!=
=
```

## Statements

```text
return
break
let
transform
sub
```

## Structures

```text
fx
loop
if
elif
else
```

## Modifiers

```text
unsafe
trans
volatile
```

---

# 32. The Full Grammar

For reference, the grammar used throughout this guide is:

```ebnf
PROGRAM ->
    (module.IMPORT | module.USING | function.FUNCTION | daop.DAOP | allocator.ALLOCATOR)*
;

MODULE_ATOM ->
    @IDENTIFIER
    | "(" MODULE_PATH ("," MODULE_PATH)* ")"
    | "*"
;

MODULE_PATH ->
    MODULE_ATOM ("." MODULE_ATOM)*
;

IMPORT ->
    "import" MODULE_PATH ";"
;

USING ->
    "using" MODULE_PATH ";"
;

BUILTIN ->
    `${u, i}${8, 16, 32, 64}`
    | `f${32, 64}`
;

COMPOSITE ->
    node.ATOM
    ("::"
        "(" (@IDENTIFIER ("," @IDENTIFIER)*) ")"
        | @IDENTIFIER
    )
;

TYPE_ATOM ->
    BUILTIN
    | COMPOSITE
    | "#" TYPE
    | "[" TYPE "]"
    | "`" TYPE
;

TYPE ->
    TYPE_ATOM ("[" @INTEGER "]")*
;

ACTION ->
    "with" (
        "(" @IDENTIFIER ("," @IDENTIFIER)* ")"
        | @IDENTIFIER
    )
;

TYPED ->
    TYPE @IDENTIFIER
;

COMPOSITE ->
    TYPED ACTION
;

ARGS ->
    TYPED | COMPOSITE
;

HEAD ->
    "fx" @IDENTIFIER "(" ARGS*[separated_by ','] ")" ":" TYPE
;

BODY ->
    "{" (structures.STRUCTURE | node.NODE ";")* "}"
;

FUNCTION ->
    HEAD BODY
;

NUMBER ->
    @INTEGER | @REAL
;

ATOM ->
    @IDENTIFIER
    | NUMBER
    | @STRING
    | "(" NODE ")"
    | "[" NODE ("|" NODE)? "]"
    | "#[" NODE ("|" NODE)? "]"
    | "`" ATOM
    | "adrs" ATOM
    | `sizeof` ATOM
;

DecideArrayOrCall ->
    ATOM (
        "[" @INTEGER "]"
        | "(" (NODE ("," NODE)*)? ")"
    )*
;

BINDING ->
    DecideArrayOrCall ("::" DecideArrayOrCall)*
;

MAGNETIC ->
    BINDING ("->" BINDING)*
;

ACCESS ->
    MAGNETIC ("." MAGNETIC)*
;

PRODUCT ->
    ACCESS (("*" | "/") ACCESS)*
;

SUM ->
    PRODUCT (("-" | "+") PRODUCT)*
;

INEQUALITY ->
    SUM (("<" | ">" | "<=" | ">=") SUM)*
;

EQUALITY ->
    INEQUALITY (("==" | "!=") INEQUALITY)*
;

ASSIGNMENT ->
    EQUALITY ("=" EQUALITY)*
;

RETURN ->
    "return" ASSIGNMENT?
;

BREAK ->
    "break" @IDENTIFIER?
;

LET ->
    "let"
    ("(" modifiers.MODIFIER ("," modifiers.MODIFIER)* ")")?
    @IDENTIFIER
    ":"
    type.TYPE
    "="
    NODE
;

TRANSFORMER ->
    "transform"
    ASSIGNMENT
    "to"
    @IDENTIFIER
    ":"
    type.TYPE
;

SUB ->
    "sub" NODE "with" NODE
;

STATEMENT ->
    RETURN | BREAK | LET | TRANSFORMER | SUB
;

NEW ->
    "new" "<" @IDENTIFIER ">" ASSIGNMENT
;

FREE ->
    "free" "<" @IDENTIFIER ">" ASSIGNMENT
;

ALLOCATORS ->
    NEW | FREE
;

NODE ->
    ASSIGNMENT | STATEMENT | ALLOCATORS
;

MODIFIER ->
    "unsafe" | "trans" | "volatile"
;

LOOP ->
    "loop" @IDENTIFIER? "{"
        (structures.STRUCTURE | node.NODE ";")*
    "}"
;

IF_COND ->
    "if" "(" node.NODE ")" "{"
        (structures.STRUCTURE | node.NODE ";")*
    "}"
;

ELIF_COND ->
    "elif" "(" node.NODE ")" "{"
        (structures.STRUCTURE | node.NODE ";")*
    "}"
;

ELSE_COND ->
    "else" "{"
        (structures.STRUCTURE | node.NODE ";")*
    "}"
;

CONDITION ->
    IF_COND | ELIF_COND | ELSE_COND
;

STRUCTURE ->
    function.FUNCTION
    | loop.LOOP
    | conditional.CONDITION
;

FIELD ->
    type.TYPE @IDENTIFIER ";"
;

DATA ->
    "data" @IDENTIFIER ";"
    | "data" @IDENTIFIER "(" type.TYPE ")" ";"
    | "data" @IDENTIFIER "[" type.TYPE "," node.INTEGER "]" ";"
    | "data" @IDENTIFIER "{"
        FIELD (FIELD)*
    "}"
;

DAOP_ACTION ->
    "action" @IDENTIFIER "{"
        function.HEAD ";"
        (function.HEAD ";")*
    "}"
;

BIND ->
    "bind"
    @IDENTIFIER
    "with"
    (
        @IDENTIFIER
        | "(" @IDENTIFIER ("," @IDENTIFIER)* ")"
    )
    "as"
    @IDENTIFIER
    "{"
        function.FUNCTION (function.FUNCTION)*
    "}"
;

ALIAS ->
    "alias" type.TYPE "as" @IDENTIFIER ";"
;

DAOP ->
    DATA | DAOP_ACTION | BIND | ALIAS
;

ALLOCATOR ->
    "allocator" @IDENTIFIER "{"
        function.FUNCTION*
    "}"
;
```

> The qualified names such as `type.TYPE`, `node.NODE`, and `structures.STRUCTURE` above reflect the grammar files' cross-file references. They are not literal Bliss syntax.

