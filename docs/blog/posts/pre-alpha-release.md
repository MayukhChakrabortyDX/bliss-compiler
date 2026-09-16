---
layout: blog-post
title: Using the Bliss CLI
description: A complete walkthrough of compiling Bliss programs from the command line.
date: September 2026
author: Bliss
category: Tooling
---

# Using the Bliss CLI

Bliss ships with a small command-line compiler. You give it a source file, and it tokenizes, parses, reports any problems it finds, and writes out the resulting AST as JSON. This post walks through every part of that workflow so you can go from "I just installed Bliss" to "I have a working compile loop" in a few minutes.

## Installing and running it

Bliss is distributed as a single compiled binary — no runtime to install, no build step. As an early tester, you'll get a build for your platform: `bliss` on Linux, `bliss.exe` on Windows.

**On Linux**, mark it executable once, then run it:

```bash
chmod +x bliss
./bliss main.bx
```

**On Windows**, no extra step is needed — just run it from a terminal (PowerShell or Command Prompt both work):

```powershell
.\bliss.exe main.bx
```

If you'd rather type a plain `bliss` instead of `./bliss` or `.\bliss.exe` every time, put the binary somewhere on your `PATH`:

```bash
# Linux
sudo mv bliss /usr/local/bin/bliss
bliss main.bx
```

```powershell
# Windows — move bliss.exe into a folder that's already on PATH,
# or add its folder to PATH via System Properties > Environment Variables
bliss.exe main.bx
```

From here on we'll just write `bliss` in examples — swap in `bliss.exe` if you're on Windows and haven't added it to `PATH`.

## Just running `bliss` on its own

If you run the command with no arguments at all, it doesn't try to compile anything. Instead it prints an introduction screen: the Bliss logo, the current build name and date, who made it, a link to the website, and a short usage summary with the available flags. Think of it as the "you're in the right place, here's how to use this" screen. It's also what you'll see if you pass `-h` or `--help` explicitly.

This is the fastest way to check that the CLI is wired up correctly, and it's a handy reference if you forget a flag name — the usage block lists every option right there.

## Compiling a single file

The basic form is:

```bash
bliss main.bx
```

This does four things, in order, and tells you about each one as it happens:

1. **Reads the file.** If the path doesn't exist, you get a clear "cannot find file" message instead of a stack trace, and the process exits immediately.
2. **Tokenizes the source.** You'll see how many tokens were produced, which is a nice sanity check if you're debugging the lexer itself.
3. **Parses the token stream.** This builds the AST and, along the way, collects any diagnostics the parser noticed.
4. **Writes the AST out as JSON**, but only if parsing produced zero diagnostics. If there were errors, the CLI stops before this step — there's no point writing out a tree built from broken input.

Every one of these steps prints a short status line, so a clean compile looks like a scrolling checklist of successes rather than silence followed by a mystery file appearing.

## Where the output goes

By default, the JSON output is named after your input file, with the extension swapped for `.json`. So:

```bash
bliss main.bx
```

produces `main.json` sitting right next to `main.bx`. If your source file lives in a subdirectory, the output lands in that same directory — the CLI preserves the path, it only changes the extension.

If you want control over the output location or name, use `-o` (or the longer `--output`), the same way you would with a C compiler:

```bash
bliss main.bx -o build/main.json
bliss main.bx --output dist/ast.json
```

Whatever path you give it is used exactly as-is, including creating the file at that name even if it doesn't share a name with your source.

## What happens when there are errors

This is the part that matters most day-to-day. The `Parser` object tracks every problem it encounters in a `diagnostics` array as it walks the token stream — it doesn't stop at the first mistake. Once parsing finishes, the CLI checks that array:

- **If it's empty**, you get a green confirmation that parsing succeeded, along with how long the whole compile took, and your JSON file is written as normal.
- **If it's not empty**, the CLI prints every diagnostic — file, line and column, the offending token, and a caret pointing at exactly where the problem is — followed by a one-line summary telling you how many errors were found in total. No JSON file is written in this case, and the process exits with a non-zero status code, so it plugs cleanly into scripts, editors, or CI without any extra glue.

Because the parser keeps going after an error instead of bailing out, one run can surface several unrelated mistakes at once. That means you can fix a batch of issues before recompiling, rather than playing whack-a-mole with one error per run.

## A typical session

Putting it all together, a normal edit-compile loop looks like this:

```bash
$ bliss main.bx
› Reading source file main.bx
✓ Read source file main.bx
› Tokenizing main.bx
✓ Tokenized 214 tokens
› Parsing
✓ Parsed 0 errors
› Writing AST build/main.json
✓ Wrote AST build/main.json

No errors. Compiled in 4.2ms
```

And if something's wrong with the source, the same command instead walks you through exactly where and why, then tells you plainly how many problems are left to fix — no digging through a giant stack trace required.

## Summary

- Run `bliss` alone to see the intro screen and usage help.
- Run `bliss <file.bx>` to tokenize, parse, and — if the input is valid — emit `<file>.json` next to it.
- Add `-o <path>` any time you want to choose the output location yourself.
- Watch the `diagnostics` count: zero means you have a fresh AST on disk; anything else means the CLI will show you precisely what to fix, and skip writing output until you do.