# Allocators

Allocators are special language constructs that define how memory is allocated and released. Unlike ordinary functions, allocators are recognized by the compiler, allowing it to reason about allocation provenance, ownership, leaks, and deallocation.

An allocator is declared using the `allocator` keyword.

```bx
allocator SystemAllocator {

    allocate(u64 size): [u8] {
        ...
    }

    deallocate([u8] ptr): void {
        ...
    }

}
```

The `allocate()` function is responsible for reserving at least `size` bytes of memory and returning a pointer to the allocated region.

The `deallocate()` function releases memory previously returned by the allocator.

Both functions may contain arbitrary implementation code. The language does not impose how memory is managed internally. An allocator may call `malloc`, `free`, `mmap`, `sbrk`, custom assembly routines, or any other implementation.

---

# Allocating Memory

Memory is allocated using the `new` operator.

```bx
let user: [User] = new<SystemAllocator> User;
```

The expression above:

* Allocates enough memory to store a `User`.
* Invokes `SystemAllocator.allocate()`.
* Returns a pointer of type `[User]`.
* Associates the allocation with `SystemAllocator`.

The compiler records the allocator used for every allocation created through `new`.

---

# Deallocating Memory

Memory allocated through `new` is released using the `delete` operator.

For local allocations, the allocator may be omitted.

```bx
let user = new<SystemAllocator> User;

delete user;
```

Because the allocation provenance of `user` is completely known within the current scope, the compiler automatically rewrites the operation to:

```bx
delete<SystemAllocator> user;
```

No runtime allocator lookup is performed.

---

# Function Boundaries

Allocator inference is intentionally limited to local symbols.

Once a pointer crosses a function boundary, the compiler no longer infers which allocator should be used.

For example:

```bx
fx destroy([User] user) {
    delete user; // Error
}
```

Instead, the allocator must become part of the function's contract.

```bx
fx destroy<SystemAllocator>([User] user) {
    delete<SystemAllocator> user;
}
```

or

```bx
fx destroy<A: allocator>([User] user) {
    delete<A> user;
}
```

This makes allocator requirements explicit and allows the compiler to verify that callers pass pointers originating from the correct allocator.

---

# Custom Allocators

Programs may define any number of allocators.

```bx
allocator ArenaAllocator {

    allocate(u64 size): [u8] {
        ...
    }

    deallocate([u8] ptr): void {
        ...
    }

}
```

```bx
allocator PoolAllocator {

    allocate(u64 size): [u8] {
        ...
    }

    deallocate([u8] ptr): void {
        ...
    }

}
```

Allocator implementations are unrestricted.

For example, an allocator may:

* Wrap `malloc` and `free`.
* Allocate directly using operating system syscalls.
* Implement an arena allocator.
* Implement a pool allocator.
* Manage memory for embedded systems.

The compiler only recognizes the allocator interface and allocation provenance. It does not impose how memory is obtained or released.

---

# Compiler Analysis

Allocations performed through the `new` operator are compiler-recognized allocation sites.

Because allocator identity is part of the language semantics, the compiler can:

* Track allocation provenance.
* Verify allocator correctness.
* Detect memory leaks.
* Detect double deallocations.
* Associate allocations with their originating allocator.
* Produce precise diagnostics through the POF analysis system.

Allocator information also forms part of function analysis. Functions that allocate or deallocate memory expose allocator requirements through their signatures, allowing the compiler to verify allocator usage across API boundaries.

---

# Ordinary Functions

Ordinary functions are **not** considered allocators.

For example:

```bx
fx myAllocate(u64 size): [u8] {
    ...
}

fx myFree([u8] ptr): void {
    ...
}
```

These functions behave like any other functions and are **not** associated with the language's allocation model.

Pointers returned from ordinary functions are treated as ordinary pointer values.

The compiler does not assume that such functions allocate or deallocate memory, and therefore cannot perform:

* Allocation provenance analysis.
* Allocator matching.
* Leak detection.
* Deallocation verification.

Programs remain free to implement custom memory management outside the allocator system, preserving the flexibility expected of a systems programming language.

Such memory is considered **untracked** by the compiler's allocation analysis.

---

# Design Rationale

The purpose of the `allocator` construct is not to restrict memory management, but to provide explicit semantic information to the compiler.

By making allocation a language construct rather than an ordinary function call, the compiler can reason about allocation provenance, allocator correctness, ownership, lifetime, and function behavior without relying on heuristics or recognizing specific function names.

Allocator inference is intentionally conservative. The compiler only infers allocator identity for local symbols whose provenance is completely known. Across function boundaries, allocator requirements become part of the function's explicit interface, enabling precise compile-time verification while avoiding hidden runtime metadata or implicit allocator dispatch.

Programs may still implement unrestricted allocation mechanisms using ordinary functions whenever compiler tracking is unnecessary. This allows Bliss to support both compiler-tracked allocation and unrestricted low-level memory management while making the distinction explicit.