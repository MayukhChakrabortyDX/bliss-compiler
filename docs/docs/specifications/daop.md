---
title: DAOP AST & Grammar
description: Syntactic specifications, AST node definitions, and formal grammar for Bliss Data-Action Oriented Programming constructs.
---

# DAOP AST & Grammar

This specification formalizes the AST node structures, formal grammar productions, and analyzer boundaries for the **Data-Action Oriented Programming (DAOP)** subsystem in the Bliss language parser.

---

## 1. Subsystem Overview & Span Tracking

* **Source File:** `compiler/parser/rules/daop.ts`
* **Parser Production:** `parseDaop(parser, sync)`
* **Architecture:** The DAOP subsystem has been completely stabilized into four dedicated `ParseNode` classifications: Data Layouts, Action Contracts, Data Bindings, and Type Aliases. Each construct uses `parser.start()` checkpoints to maintain precise byte-level source spans.

---

## 2. Data Layouts & Fields

Bliss represents memory layout declarations via `DataLayout` and field definitions via `DataField`:

```ts
export enum DataLayoutEnum {
    Linear, Array, Struct, Token
}

export class DataField extends ParseNode<ParseNodeEnum.DataField> {
    constructor(public name: string, public type: ParseNode<ParseNodeEnum.DataType>) {
        super(ParseNodeEnum.DataField)
    }
}

export class DataLayout<T extends DataLayoutEnum> extends ParseNode<ParseNodeEnum.DataLayout> {
    constructor(
        public name: string, 
        public layoutType: T, 
        public body: 
            T extends DataLayoutEnum.Token ? null :
            T extends DataLayoutEnum.Linear ? ParseNode<ParseNodeEnum.DataType> :
            T extends DataLayoutEnum.Array ? { type: ParseNode<ParseNodeEnum.DataType>, size: number } :
            ParseNode<ParseNodeEnum.DataField>[]
    ) {
        super(ParseNodeEnum.DataLayout)
    }
}
```

### Properties

| Node | Property | Type | Description |
| :--- | :--- | :--- | :--- |
| `DataField` | `name` | `string` | Field identifier name. |
| `DataField` | `type` | `ParseNode<DataType>` | Field type specification. |
| `DataLayout` | `name` | `string` | Name of the declared data structure or token. |
| `DataLayout` | `layoutType` | `DataLayoutEnum` | Layout kind: `Token` (zero-sized marker), `Linear` (wrapper), `Array` (fixed buffer), or `Struct` (composite). |
| `DataLayout` | `body` | Conditional | `null` for `Token`, type node for `Linear`, `{ type, size }` for `Array`, or array of `DataField` for `Struct`. |

### Formal Grammar

```ebnf
FIELD       -> TYPE @IDENTIFIER ';' ;

DATA_TOKEN  -> "data" @IDENTIFIER ';' ;
DATA_LINEAR -> "data" @IDENTIFIER '(' TYPE ')' ';' ;
DATA_ARRAY  -> "data" @IDENTIFIER '[' TYPE ',' @INTEGER ']' ';' ;
DATA_STRUCT -> "data" @IDENTIFIER '{' FIELD* '}' ';' ;

DATA_LAYOUT -> DATA_TOKEN | DATA_LINEAR | DATA_ARRAY | DATA_STRUCT ;
```

---

## 3. Action Contracts

Actions define abstract behavioral contracts consisting of function signatures:

```ts
export class ActionNode extends ParseNode<ParseNodeEnum.Action> {
    constructor(public name: string, public functions: ParseNode<ParseNodeEnum.Function>[]) {
        super(ParseNodeEnum.Action)
    }
}
```

### Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The action contract identifier name. |
| `functions` | `ParseNode<Function>[]` | Sequence of function heads declared as abstract requirements of this action. |

### Formal Grammar

```ebnf
ACTION -> "action" @IDENTIFIER '{' (FUNCTION_HEAD ';')* '}' ;
```

---

## 4. Data Bindings

Bindings attach concrete action implementations to declared data types:

```ts
export class DataBinding extends ParseNode<ParseNodeEnum.Bind> {
    constructor(
        public dataName: string, 
        public actionList: string[], 
        public bindingName: string, 
        public functions: ParseNode<ParseNodeEnum.Function>
    ) {
        super(ParseNodeEnum.Bind)
    }
}
```

### Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `dataName` | `string` | The target data type being bound. |
| `actionList` | `string[]` | One or more actions implemented by this binding (`with Action` or `with (Action1, Action2)`). |
| `bindingName` | `string` | Assigned alias for the binding implementation (`as BindingName`). |
| `functions` | `ParseNode<Function>[]` | Concrete function definitions fulfilling the bound action contracts. |

### Formal Grammar

```ebnf
ACTION_LIST  -> @IDENTIFIER | '(' @IDENTIFIER (',' @IDENTIFIER)* ')' ;
DATA_BINDING -> "bind" @IDENTIFIER "with" ACTION_LIST "as" @IDENTIFIER '{' FUNCTION* '}' ;
```

---

## 5. Type Aliases

Aliases introduce ergonomic naming for underlying data types:

```ts
export class TypeAlias extends ParseNode<ParseNodeEnum.Alias> {
    constructor(public name: string, public type: ParseNode<ParseNodeEnum.DataType>) {
        super(ParseNodeEnum.Alias)
    }
}
```

### Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The alias identifier introduced into scope. |
| `type` | `ParseNode<DataType>` | The underlying type being aliased. |

### Formal Grammar

```ebnf
TYPE_ALIAS -> "alias" TYPE "as" @IDENTIFIER ';' ;
```

---

## 6. Parsing vs. Semantic Analysis Boundaries

* **Parser Responsibility:**  
  Parses structural keywords (`data`, `action`, `bind`, `alias`), enforces structural delimiters and separators, and groups fields and methods into clean `ParseNode` hierarchies.
* **AST Analyzer Responsibility:**  
  - Verifies that data types referenced in `bind` exist and are accessible.
  - Validates that all function headers required by the `actionList` are concretely fulfilled in the binding body.
  - Resolves memory layouts, field byte offsets, struct padding, and alignment constraints for `DataLayout`.
