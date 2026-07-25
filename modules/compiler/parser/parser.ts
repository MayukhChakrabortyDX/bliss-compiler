//we are going to use the DI approach for better parsing management

import type { TokenType } from "../tokenizer/tokens";
import type { Node } from "./globalAst";
import { ParserBase } from "./helper";
import { decideCallOrArray, parseAccess, parseArray, parseAssignment, parseAtom, parseBinaryOperator, parseBinding, parseCall, parseEquality, parseInequality, parseLeftAssociativeOperator, parseNode, parseProduct, parserMagnetic, parseSum } from "./rules/node";

//contains the DI portion.
export class Parser extends ParserBase {

    parseAtom() {
        return parseAtom(this)
    }

    parseNode() {
        return parseNode(this)
    }

    parseArray(atom: Node) {
        return parseArray(atom, this)
    }

    parseCall(atom: Node) {
        return parseCall(atom, this)
    }

    decideCallOrArray() {
        return decideCallOrArray(this)
    }

    parseLeftAssociativeOperator(
        support: () => Node,
        operators: Map<TokenType, (left: Node, right: Node) => Node>,
        limit: null | number = null
    ) {
        return parseLeftAssociativeOperator(support, operators, this, limit)
    }

    parseBinaryOperator(generator: () => Node) {
        return parseBinaryOperator(generator, this)
    }

    parseBinding() {
        return parseBinding(this)
    }

    parseMagnetic() {
        return parserMagnetic(this)
    }

    parseAccess() {
        return parseAccess(this)
    }

    parseProduct() {
        return parseProduct(this)
    }

    parseSum() {
        return parseSum(this)
    }

    parseInequality() {
        return parseInequality(this)
    }

    parseEquality() {
        return parseEquality(this)
    }

    parseAssignment() {
        return parseAssignment(this)
    }

}