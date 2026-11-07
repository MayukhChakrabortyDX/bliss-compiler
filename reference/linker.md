Linking in bliss.

Linking is an important aspect for bliss because bliss builds on the foundation
of C programming language, so it needs to connect with external functions.

To allow that, the language provides a 'link' keyword that allows the compiler
to group functions present in a certain module.

```bx

surface stdio {
    fx print([char] str): void;
}

export global stdio;

```

```bx

using std.io.stdio;

fx log([char] str): void {
    stdio.print(str);
}

```

Now, the compiler configuration must enforce what this link actually means, and who
to link this will.

```toml
[linker]
[stdio]
linkswith="./libs/stdio.o"
linkstrategy="clang"
```

This allows for platform specifics in the compile stage only, and makes compilation
much more stable, and usable in packages.