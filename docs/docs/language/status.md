---
title: Language Status
description: Current implementation status of the Bliss language surface.
---

# Language Status

The language files separate grammar that is established from grammar still being integrated. This table keeps those distinctions visible.

| Area | Grammar source | Status |
| --- | --- | --- |
| Types | `language/implemented/types.blang` | Implemented grammar fragment |
| Expressions | `language/implemented/node.blang` | Implemented grammar fragment |
| Functions | `language/implemented/function.blang` | Implemented grammar fragment |
| Modules | `language/implemented/module.blang` | Implemented grammar fragment |
| Conditions and loops | `language/implemented/conditional.blang`, `loop.blang` | Implemented grammar fragments |
| Allocation expressions | `language/implemented/allocator.blang`, `node.blang` | Syntax represented; semantics pending |
| Modifiers | `language/implemented/modifiers.blang` | Implemented grammar fragment |
| Program root | `language/progress/program.blang` | In progress |
| Data, actions, bindings, aliases | `language/progress/daop.blang` | In progress and experimental |
| Ownership and borrowing | No current grammar source | Design topic, not a language rule |

## Four different questions

When reading the reference, distinguish these claims:

1. **Documented:** the syntax has an explanation here.
2. **Grammar-defined:** a `.blang` file describes the production.
3. **Parser-integrated:** the compiler dispatches and builds a representation for it.
4. **Semantically defined:** the language specifies what it means and when it is valid.

The first two are common in this section. The latter two are still being built for several features.

## Source map

The most useful implementation references are:

- `language/implemented/types.blang`
- `language/implemented/node.blang` for expressions and statements
- `language/implemented/function.blang`
- `language/implemented/structures.blang`
- `language/progress/program.blang`
- `language/progress/daop.blang`