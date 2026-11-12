import type { StringSpan } from "../../lexer/tokens";
import type { BindNode } from "../../parser/rules/bind";
import type { Analyzer } from "../analyzer";
import { AnalyzerDiagnostic, type DiagnosticError } from "../diagnostic";

export function analyzeBind(
    analyzer: Analyzer,
    node: BindNode,
    actions: Set<string>,
    data: Set<string>,
    identifiers: Set<string>
) {

    //it also needs access to certain context like for example, the
    //actions that were defined.
    const errorSpans: DiagnosticError[] = []

    for (let index = 0; index < node.actionNames.length; index++) {

        const actionName = node.actionNames[index] as string
        const actionNameSpan = node.actionNameSpans[index] as StringSpan

        if (!actions.has(actionName)) {

            //this means that the action is absent.
            errorSpans.push(
                {
                    span: actionNameSpan,
                    message: "I don't know this action"
                }
            )

        }

    }

    if (identifiers.has(node.bindingName)) {

        errorSpans.push({
            span: node.bindingNameSpan,
            message: "This identifier was already taken"
        })

    }

    if (!data.has(node.dataName)) {

        errorSpans.push({
            span: node.dataNameSpan,
            message: "I don't know this data type"
        })

    }

    if (errorSpans.length != 0) {
        analyzer.diagnostics.push(
            new AnalyzerDiagnostic("Structural issues in binding", errorSpans, analyzer)
        )
    }

}