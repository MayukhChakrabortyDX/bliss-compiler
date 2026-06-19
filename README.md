# Bliss Programming Language Compiler

This is a prototype compiler written in typescript for the Bliss programming language. The compiler is designed to translate Bliss code into AST as of now, but will eventually compile to C. 

## Running Test cases

Put valid bliss code in the input.txt file and from the root directory run the following command to see the AST generated for the bliss code.

```bash
bun run test
```

The output will be generated in the out.json file