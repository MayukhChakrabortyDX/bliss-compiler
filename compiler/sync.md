The sync token is used for looking ahead if a token that's
already available or not.

Generally this task can be multi-threaded because the tokens
are not changing.

Example:

fx main() {}

Assume this is our valid program. Now let's start by assuming
an invalid program.

fx () {}.

The name is missing. So, the tokenizer must search for a sync token.
we say, the following are the sync tokens:

["(", "{", EOF].

So three sync tokens are possible. Generally, EOF is included implicitly
because all programs has that in the end.