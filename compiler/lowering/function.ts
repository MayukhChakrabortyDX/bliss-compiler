//lowers the function production

import { Token, TokenType } from "../lexer/tokens";
import type { FunctionNode } from "../parser/rules/function";
import type { TypeSystem } from "../parser/rules/type";

const correspondingTypeMap = new Map<TokenType, string>()

// Signed integers
correspondingTypeMap.set(TokenType.K_i8, 'int8_t')
correspondingTypeMap.set(TokenType.K_i16, 'int16_t')
correspondingTypeMap.set(TokenType.K_i32, 'int32_t')
correspondingTypeMap.set(TokenType.K_i64, 'int64_t')

// Unsigned integers
correspondingTypeMap.set(TokenType.K_u8, 'uint8_t')
correspondingTypeMap.set(TokenType.K_u16, 'uint16_t')
correspondingTypeMap.set(TokenType.K_u32, 'uint32_t')
correspondingTypeMap.set(TokenType.K_u64, 'uint64_t')

export function lowerTypesForFunction(node: TypeSystem) {
    //this is because the lowering depends on context in C, but not in bliss
    const type = correspondingTypeMap.get(node.type.tokenType)
    const name = `${type} ${node.name}`

    return name
}

export function getReturnType(type: Token) {
    return correspondingTypeMap.get(type.tokenType)
}

export function lowerFunction(node: FunctionNode) {

    let args = ``

    for (let index = 0; index < node.args.args.length; index++) {

        args += `${lowerTypesForFunction(node.args.args[index] as TypeSystem)}`

        if (index !== node.args.args.length - 1) {
            args += ", "
        }
    }

    if (args == ``) {
        args = `void`
    }

    let returnType = `void`
    const rt = getReturnType(node.returnType)
    if ( rt != undefined ) {
        returnType = rt
    }

    let body = ``

    for ( let item of node.body ) {
        body = `${body} return ${item.body.integer.span.resolve()};`
    }

    //returns a text
    return `${returnType} ${node.name}(${args}) {${body}}`;

}