# Point of Failure (POF)
## High Precision Tracking Runtime

> **Point of Failure (POF)** is Bliss's semantic observability system for manual memory management. Rather than attempting to prohibit unsafe programs, POF tracks ownership, semantic dependencies, and programmer assumptions throughout execution. It allows developers to consciously acknowledge risks while preserving a complete audit trail of memory-related decisions.

---

# Design Philosophy

Bliss does **not** attempt to eliminate manual memory management.

Instead, it embraces three principles:

1. Heap memory is explicitly managed.
2. Stack values never escape lexical scope.
3. Every ownership assumption should be observable.

This allows Bliss to preserve the flexibility of C while providing significantly higher insight into potential memory failures.

---

# What POF Is Not

POF is **not**:

- A garbage collector.
- A borrow checker.
- A lifetime inference engine.
- A formal proof system.
- A runtime sanitizer.

POF does **not** guarantee memory safety.

Instead, it continuously records semantic ownership relationships and potential failure points so that every dangerous assumption becomes visible and reviewable.

---

# Core Language Assumptions

POF relies on two fundamental language guarantees.

## Stack Values Never Escape

A value allocated on the stack may never escape its lexical scope.

```bliss
fx bad(): `String {
    let s: String = {};
    return `s;
}
```

The compiler rejects this during semantic analysis.

This guarantee completely eliminates dangling references to stack storage without requiring explicit lifetime annotations.

---

## Heap Lifetime Is Explicit

Heap allocations are not tied to lexical scope.

```bliss
transform text: String = malloc(sizeof String);
```

The allocation remains valid until ownership explicitly releases it.

Leaving a scope destroys only the local binding—not the underlying allocation.

---

# POF Model

POF tracks two independent but connected graphs.

---

# 1. Ownership State Graph

The ownership graph tracks the lifecycle of every heap allocation.

Example:

```
Allocation

↓

Transform

↓

Take

↓

Free
```

Every ownership operation updates this graph.

---

# 2. Semantic Dependency Graph

The dependency graph records how values become semantically related.

Example:

```bliss
result = longer(a, b);
```

The compiler records:

```
result

↓

depends on

↓

{a, b}
```

This relationship exists regardless of which value is returned at runtime.

---

# Why Dependencies Matter

Suppose:

```bliss
result = longer(outer, inner);
```

Later:

```bliss
free(inner);
```

POF knows:

```
outer ─┐
        │
        ▼
     longer()
        │
        ▼
     result
        ▲
        │
inner ──┘
```

Therefore any ownership event involving `inner` may also affect `result`.

This allows POF to explain *why* a potential failure exists rather than merely reporting one.

---

# Semantic Events

POF records semantic events instead of simply observing instructions.

---

## Read

Reading memory.

Example:

```bliss
[value]->length();
```

---

## Write

Writing to memory.

Example:

```bliss
[value]->length = 5;
```

---

## Transform

Ownership changes.

Example:

```bliss
transform text: String = malloc(sizeof String);
```

---

## Take

Ownership is transferred.

Example:

```bliss
take node;
```

---

## Free

Ownership is explicitly released.

Example:

```bliss
free(node);
```

---

## Dependency

A new semantic dependency is introduced.

Examples:

```bliss
let y = x;
```

```
y ← x
```

---

```bliss
let c = a + b;
```

```
c ← {a, b}
```

---

```bliss
result = longer(a, b);
```

```
result ← {a, b}
```

---

```bliss
return x;
```

```
return ← x
```

Dependency creation allows ownership events to propagate through the semantic graph.

---

## Acknowledgement

The programmer explicitly accepts responsibility for a semantic assumption.

Example:

```bliss
ack result;
```

Acknowledgements never remove semantic information.

They only record that the programmer has consciously reviewed and accepted a particular assumption.

---

# Dependency Propagation

Whenever an ownership event occurs, POF propagates that event through the dependency graph.

Example:

```bliss
result = longer(a, b);

free(b);
```

The compiler reasons:

```
result depends on b

↓

b freed

↓

result may reference freed allocation
```

This warning is produced because of semantic dependency—not because of lexical lifetime analysis.

---

# Function Calls

Function calls are semantic boundaries.

Whenever a function returns one of its arguments—or any value derived from them—the compiler records that dependency.

Example:

```bliss
fx longer([String] a, [String] b): [String] {
    if ([a]->length() > [b]->length())
        return a;

    return b;
}
```

The compiler records:

```
return ← {a, b}
```

Every caller automatically inherits this dependency.

---

# Assumption Boundaries

POF identifies places where correctness depends upon programmer assumptions.

Examples include:

- Ownership transfers
- Conditional ownership
- Returned ownership
- Manual frees
- Unsafe casts
- External libraries
- Raw pointer manipulation
- Platform APIs

These become explicit review points.

---

# Accountability

POF does not prevent unsafe code.

Instead, it makes unsafe assumptions explicit.

Example:

```bliss
result = longer(a, b);

ack result;

free(b);
```

The programmer has accepted responsibility for the dependency involving `result`.

The compiler continues tracking the relationship.

If future failures involve this dependency, the acknowledgement remains part of the audit trail.

---

# Freedom of Expression

Bliss intentionally permits programs that may be unsafe.

Programmers retain complete control over memory management.

POF exists to ensure that dangerous assumptions are observable rather than hidden.

---

# Interoperability

POF fully supports Bliss's C interoperability model.

External functions are treated as semantic boundaries.

Their effects may be:

- inferred,
- declared,
- or acknowledged.

This allows existing C libraries to participate in POF analysis without modification.

---

# Design Principles

POF follows several principles.

- Manual memory remains manual.
- Ownership should be observable.
- Dependencies should be traceable.
- Assumptions should be explicit.
- Stack values never escape.
- Heap lifetime is explicit.
- Unsafe code is allowed.
- Every semantic decision should be auditable.

---

# Summary

Point of Failure is a semantic observability system.

Rather than proving programs correct, POF constructs two connected models:

- An ownership state graph describing heap allocation state.
- A semantic dependency graph describing how values influence one another.

Ownership events propagate through semantic dependencies, allowing the compiler to explain not only *what* may fail, but *why*.

The result is a programming model that preserves the power and flexibility of manual memory management while providing unprecedented insight into ownership flow, dependency propagation, and programmer assumptions.