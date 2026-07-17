# Bliss Point of Failure (POF) Specification
**Version:** 2.0 Draft

---

# 1. Introduction

Point of Failure (POF) is Bliss's semantic verification system.

Unlike traditional memory safety systems, POF does **not** attempt to prove that a program is free of memory errors.

Instead, POF identifies operations that invalidate assumptions about memory and requires those assumptions to become explicit and reviewable.

The goal of POF is **accountability**, not restriction.

---

# 2. Design Philosophy

POF is based on one simple observation.

> Most memory bugs originate from incorrect assumptions rather than incorrect syntax.

Traditional languages allow these assumptions to remain implicit.

Bliss records them.

POF therefore answers a different question than a borrow checker.

Instead of asking

> "Is this program legal?"

it asks

> "What assumptions does this operation require?"

If those assumptions cannot be automatically justified, the programmer acknowledges them explicitly.

---

# 3. What POF Is Not

POF is **not**

- a garbage collector
- a borrow checker
- a theorem prover
- a static memory safety proof
- an ownership type system

Programs are never rejected simply because they perform manual memory management.

Instead, POF records where engineering judgement becomes necessary.

---

# 4. Semantic State Analysis

POF operates after semantic analysis.

The parser and semantic analyzer first resolve

- types
- symbols
- member access
- ownership kinds
- function calls

Once the program has been semantically resolved, POF performs an additional analysis.

Rather than executing the program's values, POF symbolically executes its **ownership state**.

---

# 5. Semantic Events

POF recognizes a very small number of semantic events.

## Read

```bliss
let value = *ptr;
```

Reads do not invalidate assumptions.

No POF event occurs.

---

## Write

```bliss
[node].left = child;
```

Writes modify program state.

POF records writes because they may change future assumptions.

---

## Transform

```bliss
ack transform node: Node =
    malloc(sizeof Node);
```

Transforms reinterpret memory.

Since reinterpretation changes the semantic meaning of memory, every transform participates in POF.

---

## Ownership Capture

```bliss
take memory;
```

Ownership transfers to the current function.

This establishes a new ownership state and becomes a Point of Failure event.

---

# 6. Ownership State

POF maintains an abstract ownership graph throughout analysis.

For example,

```bliss
transform root: Node = malloc(...);
transform left: Node = malloc(...);

[root].left = left;
```

produces an abstract state similar to

```
root
└── left
```

The graph is symbolic.

It does not represent runtime values.

Instead, it represents ownership relationships known during compilation.

---

# 7. State Transitions

Every semantic event updates the ownership graph.

For example,

```bliss
free([root].[left]);
```

internally performs

```bliss
take left;
```

The graph becomes

```
root
└── left (captured)
```

Subsequent operations that depend upon the previous state may require acknowledgement.

---

# 8. Assumption Boundaries

Consider

```bliss
free([root].[left]);

free([root].[right]);
```

The second operation depends on traversing `root`.

However, `root` has already experienced an ownership transition through one of its members.

POF therefore reports that the operation depends on assumptions which can no longer be automatically justified.

The programmer may

- restructure the code
- explicitly acknowledge the assumption

The language itself imposes no restriction.

---

# 9. Acknowledgements

Acknowledgements document engineering judgement.

For example,

```bliss
ack;

free([root].[right]);
```

indicates

> The programmer understands that previous ownership transitions affect this operation and intentionally accepts responsibility.

Acknowledgements do not silence errors by hiding them.

They record responsibility.

---

# 10. Linear Ownership

POF naturally rewards APIs that consume old ownership and return new ownership.

Example:

```bliss
root = free(root, root.left);
```

Instead of partially modifying an existing ownership graph, the function

- captures ownership
- performs its work
- returns a new ownership state

The caller continues using the returned object.

Since previous assumptions are no longer relied upon, no acknowledgement is required.

This style minimizes Point of Failure interactions while remaining entirely optional.

---

# 11. Freedom of Expression

POF never removes expressive power from the language.

Programs that are possible in C remain possible in Bliss.

For example,

```bliss
free([root].[left]);
free([root].[right]);
```

is legal Bliss.

The compiler simply records that the second operation depends upon assumptions introduced by the first.

The programmer remains in control.

---

# 12. Accountability

The purpose of POF is accountability.

It records

- ownership transitions
- reinterpretation of memory
- assumption boundaries

rather than attempting to automatically determine correctness.

Engineering judgement remains with the programmer.

POF ensures that judgement becomes

- explicit
- reviewable
- auditable

---

# 13. Interoperability

POF does not interfere with interoperability.

Bliss is designed to remain ABI-compatible with C.

Whether compiled through

- C
- LLVM
- another backend

the language preserves C interoperability.

Manual memory management remains available.

Foreign libraries remain usable.

Existing projects may migrate incrementally.

POF operates entirely at the Bliss semantic level and introduces no runtime overhead.

---

# 14. Design Principles

Point of Failure follows six guiding principles.

## Explicit Assumptions

Assumptions should never remain invisible.

---

## Minimal Semantic Model

POF reasons about a small number of semantic events rather than a large collection of language constructs.

---

## Accountability over Restriction

POF records engineering decisions.

It does not replace them.

---

## Zero Runtime Cost

POF exists entirely during compilation.

No runtime metadata or runtime verifier is required.

---

## Backend Independence

POF analyzes Bliss semantics.

Its behavior is independent of the compiler backend.

---

## Incremental Adoption

Existing C projects should be able to adopt Bliss gradually.

POF complements existing systems programming rather than replacing them.

---

# 15. Summary

Point of Failure is a semantic ownership analysis system.

Rather than proving correctness, it tracks ownership state transitions and identifies operations whose correctness depends upon programmer assumptions.

POF recognizes only a small number of semantic events:

| Event | Purpose |
|--------|---------|
| Read | Observe memory |
| Write | Modify memory state |
| Transform | Reinterpret memory |
| Take | Capture ownership |

These events update an abstract ownership graph throughout compilation.

Whenever future operations depend upon assumptions that can no longer be automatically justified, POF requires those assumptions to become explicit.

The result is a programming model that preserves the freedom of low-level systems programming while making ownership assumptions visible, reviewable, and auditable.