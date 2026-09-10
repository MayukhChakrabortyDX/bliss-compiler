---
layout: blog-post
title: Building a parser that can recover
description: Synchronization tokens and structured recovery for a handwritten parser.
date: September 2026
author: Bliss
category: Compiler engineering
---

# Building a parser that can recover

A parser that stops at the first syntax error is easy to write. A parser that can continue usefully after an error is considerably more interesting.

## The delimiter problem

A naive recovery loop can scan until a delimiter appears. But if the delimiter is missing, that loop has no useful stopping point.

## Synchronization sets

Bliss uses the idea of separating the normal delimiter from a broader synchronization set. The parser can look for either the expected boundary or another token that provides a structurally meaningful continuation point.

## Recovery belongs to the grammar

Recovery becomes more useful when productions know about the boundaries of the branch they are part of. That lets a child production yield without consuming a token that actually belongs to a sibling or enclosing construct.

## The goal

The goal is not merely to avoid crashing on bad input. It is to make the compiler smarter about where an error happened and how much of the surrounding program can still be understood.
