# Bliss Pointer Model Specification
**Version:** 2.0 Draft

---

# 1. Introduction

Bliss models pointers around **capabilities**, not memory locations.

Unlike traditional programming languages, Bliss intentionally minimizes the number of pointer types while making operations that affect memory semantics explicit.

The language itself focuses on providing a compact ownership model, while the **Point of Failure (POF)** system performs semantic analysis over pointer operations.

The primary design goals are:

- Small and predictable pointer system
- Explicit ownership transfer
- Explicit reinterpretation of memory
- Clear programmer intent
- Strong auditability through POF

---

# 2. Pointer Tiers

Bliss provides three pointer tiers.

## Tier 1 — Reference Pointer (`)

Reference pointers provide temporary borrowed access to an existing object.

```bliss
fx increment(`i32 value): void {
    *value += 1;
}
```

### Properties

- Borrow checked
- Cannot own memory
- Cannot be freed
- Cannot outlive its borrow
- Does not participate in POF

Reference pointers are intended for ordinary safe programming.

---

## Tier 2 — Ownership Pointer ([])

Ownership pointers represent memory whose ownership may change during execution.

```bliss
let memory = malloc(256);
```

Ownership pointers may

- be moved
- be returned
- be stored
- be transformed
- transfer ownership
- eventually be released

Ownership pointers are the primary subject of POF analysis.

---

## Tier 3 — Raw Pointer (#[ ])

Raw pointers represent unmanaged or externally supplied memory.

Examples include

- Memory mapped IO
- Hardware registers
- DMA
- Foreign C libraries
- External firmware

The compiler performs minimal verification on raw pointers.

They exist to model memory outside Bliss's ownership system.

---

# 3. Pointer Transformations

Memory is sometimes allocated without knowing its final type.

Bliss performs reinterpretation using an explicit transform.

```bliss
ack transform image: Image =
    malloc(sizeof Image);
```

A transform is **not** a cast.

It represents an explicit assertion by the programmer that an existing block of memory should now be interpreted as another type.

Because incorrect interpretation may lead to corrupt reads or invalid object layouts, **every transform participates in Point of Failure analysis**.

---

# 4. Ownership Capture

Ownership transfer is explicit in Bliss.

Functions that permanently assume responsibility for a pointer must declare this using the `take` keyword.

```bliss
fx free([u8] memory): void {

    take memory;

    ...
}
```

`take` indicates

> This function permanently assumes responsibility for the supplied object.

The implementation may

- free the memory
- pool it
- defer destruction
- store it
- forward ownership elsewhere

POF is only concerned with the ownership transition itself.

The implementation strategy is irrelevant.

---

# 5. Arrays

Arrays arise naturally from pointer arithmetic.

```bliss
ack transform values: i32 =
    malloc(sizeof i32 * 20);

[values | 6] = 50;
```

The expression

```bliss
[values | index]
```

represents

> Pointer with an offset.

No dedicated array pointer exists.

This unified model naturally supports

- Arrays
- Buffers
- Images
- Network packets
- Memory pools
- Binary blobs

without introducing additional pointer categories.

---

# 6. Semantic Operations

Point of Failure operates on **semantic events**, not pointer syntax.

---

## 6.1 Read

```bliss
let value = *ptr;
```

Reading memory does not invalidate assumptions.

Reads do **not** trigger Point of Failure.

---

## 6.2 Write

```bliss
[buffer | 5] = 42;
```

Writing modifies program state.

Writes are recorded by Point of Failure because they may invalidate previous assumptions.

---

## 6.3 Transform

```bliss
ack transform header: PacketHeader =
    packet;
```

Transforms change how memory is interpreted.

Every transform participates in Point of Failure.

---

## 6.4 Ownership Capture

```bliss
take memory;
```

Ownership transfers to the current function.

This marks a trust boundary and is tracked by Point of Failure.

---

# 7. Point of Failure (POF)

POF does **not** attempt to prove memory safety.

Instead, it records semantic operations capable of invalidating assumptions about memory.

The current semantic events are

- Writes
- Pointer transformations
- Ownership capture

Functions are verified based on these events.

For example,

```bliss
fx checksum(`u8 buffer): u32 {

    ...

}
```

contains only reads.

It introduces no ownership changes and no reinterpretation.

Conversely,

```bliss
fx release([u8] memory): void {

    take memory;

    ...

}
```

captures ownership and therefore introduces a trust boundary.

---

# 8. Verification Philosophy

Point of Failure focuses on **accountability**, not automatic correctness.

The compiler records operations that require engineering judgment.

Programmers acknowledge assumptions explicitly using `ack`.

For example,

```bliss
ack transform image: Image =
    malloc(sizeof Image);
```

records that the programmer accepts responsibility for interpreting the allocated memory as an `Image`.

POF does not determine whether this decision is correct.

Instead, it ensures the decision is

- Explicit
- Visible
- Reviewable
- Auditable

---

# 9. Design Principles

The Bliss pointer model follows several core principles.

## Minimal Pointer Types

Only three pointer tiers exist.

Specialized pointer categories are intentionally avoided.

---

## Explicit Ownership

Ownership transfer never occurs implicitly.

Every ownership capture must be declared using `take`.

---

## Explicit Reinterpretation

Memory reinterpretation never occurs implicitly.

Every reinterpretation is represented using `transform`.

---

## Semantic Analysis

POF analyzes what code **does**, not merely which pointer types appear.

---

## Accountability

Bliss emphasizes documenting engineering decisions rather than attempting to infer programmer intent.

---

# 10. Summary

The Bliss pointer system consists of three pointer tiers and two explicit semantic operations.

| Feature | Purpose |
|---------|----------|
| `` ` `` | Borrowed reference |
| `[]` | Ownership-capable pointer |
| `#[]` | Raw pointer |
| `transform` | Explicit reinterpretation of memory |
| `take` | Explicit ownership capture |

Point of Failure operates on semantic events rather than pointer syntax, allowing functions to be verified based on their actual interaction with memory while keeping the language itself compact and predictable.