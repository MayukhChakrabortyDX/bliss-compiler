---
title: Language Tour
description: A long-form tour page for exploring the Bliss documentation layout.
---

# Language tour

This is an intentionally extended documentation page. It is a useful place to compare outline navigation behavior while the language design is still evolving.

## Start with a small program

A small program gives the reader a stable point of entry. The details below are illustrative rather than a final language specification.

```bliss
fx main() {
    let greeting = "hello"
    print(greeting)
}
```

The important part of the example is its shape: a named entry point, a local value, and an explicit operation. A tour should make those relationships easy to scan before it introduces deeper rules.

## Read expressions from the inside out

Expressions are where most program meaning lives. A compact expression can construct a value, choose a branch, call a function, or combine several of those operations.

When documentation introduces expressions, it benefits from moving from one small example to the next. Readers can then connect syntax to behavior without needing to memorize a complete grammar first.

### Values and bindings

A binding associates a name with a value in the current scope. Good examples show both what a name refers to and how long that name remains useful.

In a systems language, bindings eventually connect to storage, ownership, and lifetime. Those deeper topics belong in focused sections, while a tour can simply establish the vocabulary.

### Calls and results

Function calls produce results that can be named, passed onward, or returned. Keeping result flow visible is often more helpful than discussing every possible calling convention at once.

## Describe data deliberately

Data definitions give names to the structures a program manipulates. The language documentation can use them to explain which facts are known at compile time and which are represented at runtime.

This distinction becomes especially useful when a type contains resources or references. A reader should be able to identify the data boundary before learning the ownership rules that apply across it.

### Records group related state

Records collect fields that travel together. The purpose of a record is not only convenience; it also gives an API a clear shape that other code can rely on.

As the type system develops, this section can grow into the authoritative account of field visibility, initialization, and pattern matching.

### Variants model alternatives

Variants represent a value that may take one of several well-defined forms. They are useful when a program must handle success and failure, a present or missing value, or a finite set of protocol states.

The design should make unhandled alternatives hard to overlook. Documentation examples should therefore show the decision point alongside the data definition.

## Follow control flow

Control flow explains the order in which a program evaluates work. Conditions, loops, early returns, and error paths should all read as direct statements of intent.

For a language tour, the emphasis is on recognisable structure. A later reference page can specify precedence, scoping details, and every edge case.

### Make branches explicit

A branch selects one path based on a condition. Naming the condition and showing both outcomes helps the reader understand what the program guarantees after the branch completes.

Short branches are useful examples for the outline because they create a compact section between longer conceptual sections.

### Repeat work with a clear boundary

Loops repeatedly apply an operation until a condition changes or an input sequence is exhausted. The iteration boundary should be visible to both the programmer and the compiler.

When iteration involves a resource, a future specification will explain whether each step borrows, moves, or creates a new value.

## Keep modules legible

Modules separate a program into understandable units. They establish where a name is defined, what a consumer may import, and which implementation choices remain private.

Clear module boundaries also make diagnostics easier to explain. A compiler can report not only that a name is missing, but also the scope in which it was expected to exist.

## Where to go next

This final section is intentionally short. When you reach the end of the page, the outline should settle on this entry even though there may not be enough remaining document height to place this heading at the top of the viewport.

Continue with the syntax, types, and memory pages for the evolving language reference.
