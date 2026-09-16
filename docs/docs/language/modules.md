---
title: Modules and Declarations
description: Module paths, imports, allocators, and experimental declarations in Bliss.
---

# Modules and Declarations

## Imports and using declarations

Bliss supports `import` and `using` declarations with dotted module paths:

```bliss
import std.io;
using std.io.console;
```

Grouped and wildcard module atoms are also represented by the grammar:

```bliss
import (foo, bar).baz;
using *;
```

The syntax is defined in `language/implemented/module.blang`.

## Allocators

Allocator declarations name a block containing allocator functions:

```bliss
allocator heap {
    fx allocate(u32 size): u32 {
        size;
    }
}
```

Allocation expressions select an allocator explicitly:

```bliss
new<heap> size;
free<heap> value;
```

These forms describe syntax, not a finalized ownership or cleanup model.

## DAOP declarations

Data, actions, bindings, and aliases are currently in the progress grammar. Their intended forms include:

```bliss
data User {
    u32 id;
}

alias u32 as UserId;
```

The grammar source is `language/progress/daop.blang`. These declarations should be treated as experimental until parser integration and semantic rules are complete.