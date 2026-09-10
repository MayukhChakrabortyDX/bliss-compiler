---
title: Pipeline Walkthrough
description: A long-form walkthrough of an evolving compiler pipeline.
---

# Pipeline walkthrough

A compiler pipeline converts source text into a form a machine can execute. This extended walkthrough uses each stage as a navigation landmark while the implementation is still taking shape.

## Accept source text

The pipeline starts with bytes and a file identity. Before parsing can begin, the compiler needs a reliable way to preserve source locations for later diagnostics.

Keeping the original text available makes error messages, editor integrations, and test snapshots much more useful. It also prevents later stages from needing to reconstruct context they no longer own.

## Build tokens

Lexing groups characters into tokens such as identifiers, literals, punctuation, and keywords. A token stream is simpler for a parser to reason about than individual characters.

The lexer also records spans. Those spans let later stages refer back to the precise source region that produced a value or an error.

### Recover from unexpected input

Real source files are often incomplete while a developer is typing. A resilient lexer should report unexpected input without preventing the parser from seeing the valid text that follows.

Recovery is not only a user-interface concern. It influences the shape of internal APIs because every stage needs to represent useful partial results.

## Parse structure

Parsing turns a token stream into a tree that represents the program’s structure. The tree records enough syntax to support clear diagnostics and later transformations.

A good parser separates recognition from recovery where possible. That makes it easier to test a valid grammar while also improving messages for malformed input.

### Preserve meaningful spans

Every major node should carry a source span. When a later analysis discovers an issue, it can point to the expression that caused it rather than producing a generic stage-level error.

Spans also make tooling features possible. A language server can connect a symbol, its uses, and its documentation back to exact positions in an editor.

## Resolve names

Name resolution connects identifiers to declarations. It answers which binding a reference means and detects ambiguous or missing names before more expensive analysis begins.

Module boundaries, imports, and local scopes all meet at this stage. Clear internal representations make diagnostics more specific and prevent resolution rules from leaking into unrelated passes.

## Check semantics

Semantic analysis verifies that a well-formed tree also makes sense according to the language rules. Type relationships, control-flow constraints, and ownership checks are likely to live here or in closely related passes.

The implementation should keep this phase explainable. Users benefit when a diagnostic can name the rule, show the relevant source locations, and suggest the smallest useful correction.

### Produce typed representations

A typed representation gives later stages facts they should not need to rediscover. It can annotate expressions with inferred types and resolve references to stable identifiers.

The boundary is valuable because optimizations and code generation can work from semantic meaning rather than spelling-level syntax.

### Keep diagnostics connected

Diagnostics should retain enough context to explain an issue in terms of source code. A compiler is more approachable when it can show the cause, the affected location, and the path that led there.

This section is longer by design: it lets you check that the outline changes naturally across content with different heights.

## Lower into intermediate forms

Lowering converts a high-level program into representations that are easier to analyze or execute. Each representation should have a clear purpose and a narrow set of invariants.

Explicit lowering stages also create natural testing boundaries. A test can inspect one representation without requiring every later backend feature to be complete.

## Emit a result

The final stages generate code, an artifact, or another executable form. They also need to return diagnostics and metadata in a way that tools can consume.

This last section is intentionally compact. It checks whether the outline correctly marks a final heading when there is little scroll distance remaining.
