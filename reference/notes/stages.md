# How would stages work

All files are stored here -> `input[]`

1. [load file] -> push it in `input` array
2. [tokenize] the said file
3. [parse] the said file
4. [analyze] the said file -> push it in the `output` array
5. [lower] the `output` array
6. now pass on to the compiler infra

```main.bx

import std.io.println;
using add.add;

fx main() {
    println(add(10, 20));   
}

```

```add.bx

fx add(data a: i32, data b: i32): i32 {
    return a + b;
}

export add; //this is exported locally by default unless you explicitly make it global

```
```ts
input =
[{
    filename: "main.bx",
    contents: ``
}]
```

