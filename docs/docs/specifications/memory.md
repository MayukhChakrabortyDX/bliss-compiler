---
title: Memory Model & Capability Specification
description: Formal specification of Bliss memory tiers, pointer capabilities, lexical ownership, and Point of Failure (POF) runtime tracking.
---

# Memory Model Specification

This specification formalizes the Bliss memory architecture, pointer capability tiers, lifetime bounds, and the **Point of Failure (POF)** semantic observability runtime.

---

## Design Guarantees

The Bliss memory model satisfies three foundational invariants:

1. **Explicit Allocation Provenance**: Every heap allocation records its backing allocator. The compiler tracks provenance to ensure deallocation determinism.
2. **Stack Confinement**: Stack-allocated temporary values never escape lexical block scope, preventing dangling reference creation.
3. **Semantic Auditability**: Risky pointer operations participate in Point of Failure (POF) tracking, providing compile-time and runtime diagnostics.

---

## Pointer Capability Tiers

Bliss organizes pointer operations into three distinct capability tiers:

### Tier 1 — Borrowed Reference (`T)
A reference provides temporary, non-owning borrowed access to an existing value.

```bliss
fx accumulate(`i32 total, i32 delta): void {
    `total += delta;
}
```

* **Capabilities**: Read, write (if mutable).
* **Guarantees**: Cannot own memory; cannot outlive its borrow; cannot be freed; does not leak.

### Tier 2 — Managed Pointer ([T])
Managed pointers represent uniquely owned heap resources tied to a specific allocator declaration.

```bliss
let user: [User] = new<SystemAllocator> User;
delete user;
```

* **Capabilities**: Dereference, field access, explicit deallocation via `delete`.
* **Guarantees**: Provenance is strictly verified by the compiler; deallocation invokes the associated allocator's `deallocate` method.

### Tier 3 — Raw Native Pointer (*T)
Raw pointers provide unconstrained address manipulation for hardware interfacing and FFI.

```bliss
let raw_buffer: *u8 = get_device_mmio_address();
```

* **Capabilities**: Pointer arithmetic, arbitrary casting, memory reinterpretation.
* **Audit Rule**: All Tier 3 dereferences register as semantic risk nodes within the Point of Failure (POF) analysis engine.

---

## Point of Failure (POF) Architecture

The POF system tracks semantic ownership assumptions throughout compilation and execution:

```
[ Allocation Site ] ─── Provenance Tag ───> [ Lexical Block Scope ]
                                                    │
                                           Ownership Verified?
                                            ├── Yes ──> Deterministic Cleanup
                                            └── No  ──> POF Diagnostic Trace
```

* **Provable Safe Paths**: When ownership does not escape local scope, deallocation is verified and synthesized automatically.
* **Complex Escapes**: When values escape through function boundaries or asynchronous channels, POF attaches tracking nodes to record ownership transfer.
