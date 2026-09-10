---
title: Parsing
description: Error recovery and synchronization in the Bliss parser.
---

# Parsing

Bliss's parser is being designed around structured recovery rather than treating malformed input as a reason to abandon the current production.

## Synchronization tokens

A parser can scan toward a meaningful continuation point instead of blindly consuming input until an arbitrary delimiter appears.

## Two-set recovery

A recovery operation can distinguish between the token that normally terminates a production and a wider synchronization set that lets the parser regain a useful structural boundary.

## Branch-level recovery

Synchronization information can flow downward into child productions. A child can stop before consuming a token that belongs to a sibling or enclosing construct, allowing the parent production to resume parsing from that boundary.
