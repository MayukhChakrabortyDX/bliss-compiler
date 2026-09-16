import { TokenType } from "../lexer/tokens"
import { union } from "./utility/union"

export class First {

    static FunctionHead = union(TokenType.K_Fx)
    static FunctionProduction = union(First.FunctionHead)
    static LoopProduction = union(TokenType.K_Loop)
    static Modifier = union(TokenType.K_Unsafe, TokenType.K_Trans, TokenType.K_Volatile)
    static Module = {
        Import: union(TokenType.K_Import),
        Using: union(TokenType.K_Using)
    }

    static Atom = union(
        TokenType.Identifier, TokenType.RealNumber,
        TokenType.Integer, TokenType.String,
        TokenType.LBrace, TokenType.LSquareBrace,
        TokenType.HashSymbol, TokenType.Backtick,
        TokenType.K_Adrs, TokenType.K_Sizeof
    )

    static Node = union(
        First.Atom,
        TokenType.K_New, TokenType.K_Free,
        TokenType.K_Return, TokenType.K_Break, TokenType.K_Let, TokenType.K_Transform, TokenType.K_Sub
    )

    static ProgramProduction = union(
        First.Module.Import,
        First.Module.Using
    )


    static Condition = union(TokenType.K_If, TokenType.K_Elif, TokenType.K_Else)

    static BuiltinType = union(
        TokenType.K_u8, TokenType.K_u16, TokenType.K_u32, TokenType.K_u64,
        TokenType.K_i8, TokenType.K_i16, TokenType.K_i32, TokenType.K_i64,
        TokenType.K_f32, TokenType.K_f64 //that's it for now
    )

    static Structure = {
        Structure: union(First.FunctionProduction, First.LoopProduction, First.Condition),
        Body: union(TokenType.LBracket)
    }

    static Type = union(
        First.BuiltinType, First.Atom, TokenType.Identifier, TokenType.HashSymbol, TokenType.LSquareBrace, TokenType.Backtick
    )

    static Allocator = union(TokenType.K_Allocator)
    static DAOP = union(
        TokenType.K_Data,
        TokenType.K_Action,
        TokenType.K_Bind,
        TokenType.K_Alias
    )

}