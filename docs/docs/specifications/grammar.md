---
title: Formal Grammar Specification
description: Lexical tokens, operator precedence, grammar productions, and EBNF syntax definitions for Bliss.
---

# Formal Grammar Specification

This specification defines the formal lexical structure and syntactic grammar of the Bliss programming language using Extended Backus-Naur Form (EBNF).

---

## Lexical Structure

### Character Set
Bliss source files are encoded in UTF-8. Source text is analyzed into a stream of tokens, comments, and whitespace trivia.

### Whitespace & Comments
Whitespace (spaces, tabs, newlines) serves only to separate tokens. Comments are stripped during lexical scanning:

```bliss
// Single line comment
/* Multi-line
   block comment */
```

### Identifiers
Identifiers start with an ASCII letter or underscore, followed by any sequence of letters, digits, or underscores:

```ebnf
IDENTIFIER  ::= [a-zA-Z_][a-zA-Z0-9_]*
```

### Keywords
Reserved keywords cannot be used as ordinary identifiers:
`fx`, `let`, `mut`, `if`, `else`, `while`, `for`, `in`, `return`, `match`, `type`, `struct`, `enum`, `import`, `allocator`, `new`, `delete`.

---

## Production Rules

### Declarations

```ebnf
Program        ::= Item*
Item           ::= FunctionDecl | TypeDecl | AllocatorDecl | ImportDecl

FunctionDecl   ::= "fx" IDENTIFIER "(" ParameterList? ")" (":" Type)? Block
ParameterList  ::= Parameter ("," Parameter)*
Parameter      ::= IDENTIFIER ":" Type

TypeDecl       ::= "type" IDENTIFIER "=" (StructType | EnumType | Type) ";"
StructType     ::= "struct" "{" (IDENTIFIER ":" Type ";")* "}"
EnumType       ::= "enum" "{" (IDENTIFIER ("(" Type ")")? ";")* "}"

ImportDecl     ::= "import" Path ("::" "{" IDENTIFIER ("," IDENTIFIER)* "}")? ";"
Path           ::= IDENTIFIER ("." IDENTIFIER)*
```

### Statements

```ebnf
Statement      ::= LetStmt | AssignmentStmt | ReturnStmt | ExprStmt | Block
LetStmt        ::= "let" "mut"? IDENTIFIER (":" Type)? ("=" Expression)? ";"
AssignmentStmt ::= TargetAssign "=" Expression ";"
ReturnStmt     ::= "return" Expression? ";"
ExprStmt       ::= Expression ";"
Block          ::= "{" Statement* "}"
```

### Expressions & Operator Precedence

Precedence levels are ordered from lowest to highest:

| Level | Operator Category | Operators | Associativity |
| :--- | :--- | :--- | :--- |
| **1** | Logical OR | <code>\|\|</code> | Left |
| **2** | Logical AND | `&&` | Left |
| **3** | Equality | `==`, `!=` | Left |
| **4** | Relational | `<`, `<=`, `>`, `>=` | Left |
| **5** | Additive | `+`, `-` | Left |
| **6** | Multiplicative | `*`, `/`, `%` | Left |
| **7** | Unary | `!`, `-`, `~`, `*` (deref), `&` (ref) | Right |
| **8** | Primary / Postfix | `()`, `[]`, `.`, `->` | Left |
