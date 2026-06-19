export class StringContainer {
    constructor(public str: string) {}
}

export class StringSpan {
    constructor( public startIndex: number, public endIndex: number, public str: StringContainer ) {}
}

export enum TokenType {
    K_Data,
    K_If,
    K_Action,
    K_Bind,
    K_Fx,
    K_Import,
    K_Using,
    K_View,
    K_Let,
    K_As,
    K_Return,
    K_Ptr,
    K_Set,
    K_Get,
    K_CSet,
    K_CGet,
    K_Else,
    K_Elif,
    K_Loop,
    K_Break,
    K_Continue,
    K_With,
    K_Alias,

    ScanningState, //this means when we are starting to scan basically
    Identifier,
    Integer,
    RealNumber,
    Dot,
    LBrace, // '('
    RBrace, // ')'
    LSquareBrace,
    RSquareBrace,
    LBracket,
    RBracket,
    Semicolon,
    Assignment,
    Compare,
    Comma,
    Add,
    Increment,
    String,
    Colon,
    Minus,

    Multiply,
    Divide,

    Decrement,
    ArrowRight,
    GreaterThan,
    GreaterThanEqual,
    LessThan,
    LessThanEqual,
    Negation,
    NotEqual,
    EOF
}

export class Token {

    constructor( public tokenType: TokenType, public span: StringSpan, public row: number, public column: number ) {}

}