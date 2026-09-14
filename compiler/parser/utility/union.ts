import type { TokenType } from "../../lexer/tokens";

export function union<T extends TokenType>(...values: (T | Set<T>)[]): Set<T> {
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