import type { DataStructure } from "../../parser/rules/build-4i/data";
import type { TypeSystem } from "../../parser/rules/build-4i/type";
import { lowerTypesForFunction } from "./function";

export function lowerDataStructure(node: DataStructure) {

    const template = (name: string, body: string) => `typedef struct {${body}} ${name};`
    let body = ``


    for (let index = 0; index < node.body.length; index++) {

        body += `${lowerTypesForFunction(node.body[index] as TypeSystem)};`
    }

    return template(node.name, body)

}