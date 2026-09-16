import type { TokenType } from "../../lexer/tokens";

type Sync = Set<TokenType>

export function union<T extends TokenType>(...values: (T | Set<T>)[]): Sync {
    const result = new Set<T>();

    for (const value of values) {
        if (value instanceof Set) {
            for (const item of value) {
                result.add(item);
            }
        } else {
            result.add(value);
        }
    }

    return result;
}