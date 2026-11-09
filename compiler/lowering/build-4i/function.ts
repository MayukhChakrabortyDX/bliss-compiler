//lowers the function production

import { TokenType } from "../../lexer/tokens";
import type { FunctionNode } from "../../parser/rules/build-4i/function";
import type { TypeSystem } from "../../parser/rules/build-4i/type";

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
    //returns a text
    return `void ${node.name}(${args}) {}`;

}