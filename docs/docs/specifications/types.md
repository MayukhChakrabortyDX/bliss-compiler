---
title: Type System Specification
description: Formal specification of scalar primitives, algebraic data types, structural records, and exhaustiveness checking in Bliss.
---

# Type System Specification

This specification defines the static type system of Bliss, covering scalar primitives, algebraic data types (ADTs), structural records, and exhaustiveness invariants.

---

## 1. Scalar Primitives

Bliss defines exact-width integer, floating-point, boolean, and character types with fixed memory layouts:

| Type | Kind | Width (Bits) | Representation |
| :--- | :--- | :--- | :--- |
| `i8`, `i16`, `i32`, `i64` | Signed Integer | 8, 16, 32, 64 | Two's complement |
| `u8`, `u16`, `u32`, `u64` | Unsigned Integer | 8, 16, 32, 64 | Binary unsigned |
| `f32`, `f64` | Floating Point | 32, 64 | IEEE 754 single / double precision |
| `bool` | Boolean | 8 | `0` = false, `1` = true |
| `char` | Unicode Scalar | 32 | UTF-32 scalar value (0x0 to 0x10FFFF) |
| `void` | Unit / Empty | 0 | Zero-sized type |

---

## 2. Structural Record Types

Records group heterogeneous fields with deterministic struct alignment:

```bliss
type Point = struct {
    x: f64;
    y: f64;
};
```

### Alignment & Padding Rules
* Each field offset aligns to the field's natural alignment (`alignof(T)`).
* Struct size is rounded up to the nearest multiple of the largest field alignment.
* Optional `#packed` attribute forces 1-byte alignment without padding.

---

## 3. Algebraic Data Types (Sum Types)

Bliss represents variants as discriminated unions carrying an integer tag and payload:

```bliss
type Result = enum {
    Ok(i32);
    Err(str);
};
```

### Memory Layout
* **Tag Field**: Smallest unsigned integer capable of representing all variants (`u8` for <= 256 variants).
* **Payload Union**: Overlaid memory storage aligned to the maximum alignment among all variant payloads.

### Exhaustiveness Invariant
Every `match` expression over an algebraic enum must exhaustively cover all defined variants:

```bliss
match result {
    Result.Ok(value) => println("Success: {}", value),
    Result.Err(msg)   => println("Failed: {}", msg),
}
```

Omitting any variant without an explicit fallback (`_ => ...`) triggers compile-time error `E0142: Non-exhaustive pattern match`.
