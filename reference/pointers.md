# Bliss Pointer Model Specification
**Version:** 2.2 Draft

---

# 1. Introduction

Bliss models pointers around **capabilities**, not memory locations.

Unlike traditional programming languages, Bliss intentionally minimizes the number of pointer types while making operations that affect memory semantics explicit.

The language itself focuses on providing a compact ownership model, while the **Point of Failure (POF)** system performs semantic analysis over pointer operations.

Additionally, Bliss distinguishes between **stack-confined values** and **ownership-capable values**, allowing the compiler to guarantee safe temporary object graphs without requiring a complex borrow checker.

The primary design goals are:

- Small and predictable pointer system
- Explicit ownership transfer
- Explicit memory reinterpretation
- Stack-confined temporary objects
- Clear programmer intent
- Strong auditability through POF

---

# 2. Pointer Tiers

Bliss provides three pointer tiers.

## Tier 1 — Reference Pointer (`)

Reference pointers provide temporary borrowed access to an existing object.

```bliss
fx increment(`i32 value): void {

    `value += 1;

}
```

### Properties

- Borrow checked
- Cannot own memory
- Cannot be freed
- Cannot outlive its borrow
- Do not participate in Point of Failure

Reference pointers are intended for ordinary safe programming.

---

## Tier 2 — Ownership Pointer ([])

Ownership pointers represent memory whose ownership may change during execution.

```bliss
let memory = new<Malloc> SomeMemory;
```

Ownership pointers may

- be moved
- be returned
- be stored
- transfer ownership
- eventually be released

Ownership pointers are the primary subject of Point of Failure analysis.

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

# 3. Stack-Confined Values

Some data structures are intended to exist exclusively within the lifetime of a function.

Such values are known as **stack-confined values**.

A stack-confined value is guaranteed not to escape the activation record in which it is created.

This allows temporary object graphs to be built entirely on the stack while safely storing references between participating objects.

For example,

```bliss
import omega.ui.(Window);

fx main(): void {

    let window: Window = ReferenceWindow();
    let button: Button = Button("Click Me");

    window.addButton(`button);

}
```

The compiler guarantees that both `window` and `button` remain confined to the stack frame of `main`.

Neither value may escape the function.

---

## 3.1 Escape Restrictions

A stack-confined value may **not**

- be returned
- be heap allocated
- be stored inside ownership pointers
- be stored inside global variables
- be captured by closures that outlive the defining function
- otherwise escape its defining activation record

These guarantees ensure that every stored reference always refers to another value with a compatible lifetime.

---

## 3.2 Reference Fields

Only stack-confined values may contain reference fields.

For example,

```bliss
data Button {

    parent: `Window;
    label: `String;

}
```

Reference fields describe temporary relationships between stack-confined values.

---

## 3.3 Lifetime Separation

A type containing reference fields may **not** contain ownership pointers or raw pointers.

For example,

```bliss
data Widget {

    parent: `Window;
    memory: [u8];

}
```

is invalid.

A stack-confined type may contain only

- ordinary value fields
- reference fields

Ownership-capable types may contain

- ordinary value fields
- ownership pointers
- raw pointers

but never reference fields.

This intentionally separates temporary lifetime relationships from long-lived ownership semantics.

---

## 3.4 Transitive Confinement

Stack confinement is transitive.

If a type contains a stack-confined value, it also becomes stack-confined.

```bliss
data Button {

    parent: `Window;

}

data Panel {

    button: Button;

}
```

Since `Button` is stack-confined, `Panel` automatically becomes stack-confined.

This property is inferred by the compiler.

---

# 4. Binding Modifiers

Bliss allows variable declarations to be qualified using **binding modifiers**.

Binding modifiers alter the semantics of a variable declaration without introducing new declaration syntax.

Examples include

```bliss
let value: i32 = 42;

unsafe let device: #[u8] = DeviceAddress();
transform let image: Image = new<Malloc> Image;

```

Multiple modifiers may exist in the language over time while preserving a consistent declaration model.

---

## 4.1 Transform

Memory is sometimes obtained without knowing its final interpretation.

Bliss represents reinterpretation using the `transform` binding modifier.

```bliss
transform let image: Image = new<Malloc> Image;
```

A transform is **not** a cast.

It represents an explicit assertion by the programmer that an existing block of memory should now be interpreted as another type.

Because incorrect interpretation may produce invalid object layouts or corrupt reads, every transform participates in Point of Failure analysis.

---

## 4.2 Unsafe

The `unsafe` binding modifier explicitly acknowledges that the declaration may bypass normal compiler guarantees.
It also makes the value be addressable if it's already not a pointer type.

```bliss
volatile unsafe let registers: #[u32] =
    HardwareRegisters();
```

Unsafe declarations participate in Point of Failure analysis according to the operations they perform.

---

# 5. Ownership Capture

Ownership transfer is explicit in Bliss.

Functions that permanently assume responsibility for a pointer declare this using the `take` keyword.

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

Point of Failure is concerned only with the ownership transition itself.

The implementation strategy is irrelevant.

---

# 6. Arrays

Arrays arise naturally from pointer arithmetic.

```bliss
transform let values: i32 = new<Malloc> i32[20];

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

# 7. Semantic Operations

Point of Failure operates on **semantic events**, not pointer syntax.

---

## 7.1 Read

```bliss
let value: [Type] = some_pointer;
```

Reading memory does not invalidate assumptions.

Reads do **not** trigger Point of Failure.

---

## 7.2 Write

```bliss
[buffer | 5] = 42;
```

Writing modifies program state.

Writes are recorded because they may invalidate previous assumptions.

---

## 7.3 Transform

```bliss
transform let header: PacketHeader =
    packet;
```

Transforms change how memory is interpreted.

Every transform participates in Point of Failure analysis.

---

## 7.4 Ownership Capture

```bliss
take memory;
```

Ownership transfers to the current function.

This represents a trust boundary and is tracked by Point of Failure.

---

# 8. Point of Failure (POF)

Point of Failure does **not** attempt to prove memory safety.

Instead, it records semantic operations capable of invalidating assumptions about memory.

The current semantic events are

- Writes
- Memory reinterpretation (`transform`)
- Ownership capture (`take`)

Functions are verified according to these events.

For example,

```bliss
fx checksum(`u8 buffer): u32 {

    ...

}
```

contains only reads.

It introduces neither ownership transitions nor reinterpretation.

Conversely,

```bliss
fx release([u8] memory): void {

    take memory;

    ...

}
```

captures ownership and therefore introduces a trust boundary.

---

# 9. Verification Philosophy

Point of Failure focuses on **accountability**, not automatic correctness.

The compiler records operations that require engineering judgment.

For example,

```bliss
transform let image: Image = new<Malloc> Image;
```

records that the programmer intentionally interprets an existing memory region as an `Image`.

Point of Failure does not determine whether this decision is correct.

Instead, it ensures the decision is

- Explicit
- Visible
- Reviewable
- Auditable

---

# 10. Design Principles

The Bliss pointer model follows several core principles.

## Minimal Pointer Types

Only three pointer tiers exist.

Specialized pointer categories are intentionally avoided.

---

## Stack Confinement

Temporary object graphs remain confined to a single activation record.

Reference relationships never escape their defining scope.

---

## Separation of Lifetimes

Reference fields model temporary relationships.

Ownership pointers model long-lived ownership.

The two models are intentionally kept separate.

---

## Explicit Ownership

Ownership transfer never occurs implicitly.

Every ownership capture must be declared using `take`.

---

## Explicit Reinterpretation

Memory reinterpretation never occurs implicitly.

Every reinterpretation is represented using the `transform` binding modifier.

---

## Semantic Analysis

Point of Failure analyzes what code **does**, not merely which pointer types appear.

---

## Accountability

Bliss emphasizes documenting engineering decisions rather than attempting to infer programmer intent.

---

# 11. Summary

The Bliss pointer model combines three pointer tiers with stack-confined values and a small set of explicit semantic operations.

| Feature | Purpose |
|---------|---------|
| `` ` `` | Borrowed reference |
| `[]` | Ownership-capable pointer |
| `#[]` | Raw pointer |
| Stack-confined values | Temporary object graphs that cannot escape their defining function |
| `transform let` | Explicit reinterpretation of memory |
| `unsafe let` | Makes the let addressable |
| `take` | Explicit ownership capture |

Point of Failure operates on semantic events rather than pointer syntax, allowing functions to be verified according to their actual interaction with memory while keeping the language compact, predictable, and auditable.