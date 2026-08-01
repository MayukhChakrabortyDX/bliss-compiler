//we are going to use the DI approach for better parsing management

import type { TokenType } from "../tokenizer/tokens";
import type { Node } from "./globalAst";
import { ParserBase } from "./helper";
import { parseAllocator } from "./rules/allocator";
import { parseCondition } from "./rules/conditional";
import { parseBody, parseFunction } from "./rules/function";
import { decideBody, parseLoop } from "./rules/loop";
import { parseModifier } from "./rules/modifiers";
import { parseModule } from "./rules/module";
import { decideAllocator, decideCallOrArray, decideStatement, parseAccess, parseArray, parseAssignment, parseAtom, parseBinaryOperator, parseBinding, parseBreakStatement, parseCall, parseEquality, parseFree, parseInequality, parseLeftAssociativeOperator, parseLet, parseNew, parseNode, parseProduct, parseReturnStatement, parserMagnetic, parseSubstitution, parseSum, parseTransform } from "./rules/node";
import { parseStructures } from "./rules/structures";
import { parseArrayType, parseBuiltinTypes, parseCompositeType, parseHandleType, parseIdentifierType, parsePointerType, parseReferenceType, parseType } from "./rules/types";

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

    parseReturnStatement() {
        return parseReturnStatement(this)
    }

    parseBreakStatement() {
        return parseBreakStatement(this)
    }

    decideStatement() {
        return decideStatement(this)
    }

    parseNew() {
        return parseNew(this)
    }
    
    parseFree() {
        return parseFree(this)
    }

    decideAllocator() {
        return decideAllocator(this)
    }

    //types
    parseBuiltinTypes() {
        return parseBuiltinTypes(this)
    }

    parseCompositeType() {
        return parseCompositeType(this)
    }

    parseIdentifierType() {
        return parseIdentifierType(this)
    }

    parseHandleType() {
        return parseHandleType(this)
    }
    
    parsePointerType() {
        return parsePointerType(this)
    }

    parseReferenceType() {
        return parseReferenceType(this)
    }

    parseArrayType() {
        return parseArrayType(this)
    }

    parseType() {
        return parseType(this)
    }

    parseModifier() {
        return parseModifier(this)
    }

    parseLet() {
        return parseLet(this)
    }

    parseTransform() {
        return parseTransform(this)
    }

    parseSubstitution() {
        return parseSubstitution(this)
    }

    parseAllocator() {
        return parseAllocator(this)
    }

    parseModule() {
        return parseModule(this)
    }

    parseStructure() {
        return parseStructures(this)
    }

    decideBody() {
        return decideBody(this)
    }

    parseLoop() {
        return parseLoop(this)
    }

    parseBody() {
        return parseBody(this)
    }

    parseFunction() {
        return parseFunction(this)
    }

    parseCondition() {
        return parseCondition(this)
    }

}