---
title: Memory Walkthrough
description: A long-form walkthrough for comparing memory documentation navigation.
---

# Memory walkthrough

This exploratory guide describes the questions a memory model must answer. It is not a finalized specification, but its section structure is deliberately long enough to test documentation navigation.

## State the ownership question

Every value has a story about where it comes from, who may use it, and when its storage can be reclaimed. An ownership model turns that story into rules that can be checked consistently.

The language should make the important transfer points obvious in ordinary code. Hidden ownership changes are difficult to learn and even harder to debug.

## Separate borrowing from owning

An owned value carries responsibility for the resource it represents. A borrowed view provides temporary access without taking that responsibility away from its owner.

This separation gives APIs a way to express intent. A function can document whether it needs to keep a value, inspect it briefly, or change it in place.

### Shared access

Shared access lets several parts of a program observe the same value. The rules need to preserve useful reading patterns while preventing an observer from relying on invalid storage.

The exact syntax remains open, but the underlying question is stable: what facts can the compiler prove while the shared view exists?

### Exclusive access

Exclusive access exists when an operation needs to change a value safely. It must be obvious that no competing operation can observe an inconsistent intermediate state.

The documentation will eventually describe the relationship between exclusivity, aliases, and calls across module boundaries.

## Track lifetime boundaries

Lifetimes describe when a value or view remains valid. A useful model makes ordinary local code straightforward and reserves annotations or advanced mechanisms for the genuinely complex cases.

Small examples should show a view being created, used, and released within one clear region of code. Larger examples can introduce returns, collections, and asynchronous work.

## Design for resource safety

Memory is only one kind of resource. Files, sockets, locks, and handles all benefit from predictable acquisition and release rules.

If the same language feature explains both memory and non-memory cleanup, programs become easier to reason about. The compiler can then give focused diagnostics when a resource crosses an unsafe boundary.

### Transfers are deliberate

A transfer changes which part of a program is responsible for a resource. It should occur at an explicit point, such as a call, assignment, or return.

Making transfers visible helps a reader see why an earlier name may no longer be used. It also gives tools a natural location for actionable messages.

### Cleanup follows structure

Structured cleanup means that releasing a resource follows the program’s scope and control flow. This gives error paths the same predictable behavior as successful paths.

The final rules will need to address partial initialization and failures during construction. Those cases are valuable because they test whether the model remains coherent under pressure.

## Compare tradeoffs honestly

No memory model is free. More inference can make simple code shorter, while more explicitness can make boundaries easier to audit.

Bliss is exploring where that balance should sit for systems programming. This page records the questions so that future design choices have clear context.

## Next experiments

The next step is to turn these principles into executable examples and compiler diagnostics. This short final section is useful for checking the outline state near the end of a document.
