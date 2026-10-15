import { TokenType } from "../../lexer/tokens";
import { First } from "../first";
import type { Parser } from "../parser";
import { branchGroup, createBranch } from "../utility/branch";
import { nterm, token } from "../utility/linear";
import { ParseNode, ParseNodeEnum } from "../utility/parse_node";
import { union } from "../utility/union";

export enum ModPathKind {
    Identifier, DotGroup, BracketGroup, All,
}

export class ModPath<T extends ModPathKind> extends ParseNode<ParseNodeEnum.ModulePath> {

    constructor(
        public pathKind: T,
        public body:
            T extends ModPathKind.All ? null :
            T extends ModPathKind.Identifier ? string :
            ParseNode<ParseNodeEnum.ModulePath>[] 
    ) {
        super(ParseNodeEnum.ModulePath)
    }

}

namespace ModuleAtom {

    const identifierBranch = createBranch((parser, sync) => {

        const name = parser.digest({
            expected: TokenType.Identifier,
            sync,
            title: "Expected an indentifier"
        })

        return new ModPath(ModPathKind.Identifier, name)

    }, TokenType.Identifier)

    const enclosedBracketBranch = createBranch((parser, sync) => {

        parser.advance(); //because we already matched the first token in the branch itself.
        const paths: ParseNode<ParseNodeEnum.ModulePath>[]  = []

        parser.useLoop({
            callback: (item: ParseNode<ParseNodeEnum.ModulePath>) => paths.push(item),
            production: (parser, sync) => ModulePath.parse(parser, sync),
            deliminator: TokenType.RBrace,
            separator: TokenType.Comma,
            sync: union(sync, TokenType.RBrace),
            first: ModulePath.first,
            titles: {
                closing: "Expected a closing ')' bracket",
                separator: "Expected a comma separator before next production",
                separatorMissing: "Expected a comma separator"
            }
        })

        return new ModPath(ModPathKind.BracketGroup, paths)

    }, TokenType.LBrace)

    const asteriskBranch = createBranch((parser, _) => {

        //the reason is simple because this branch was even selected.
        parser.advance()
        return new ModPath(ModPathKind.All, null)

    }, TokenType.Multiply)

    const branch = branchGroup(identifierBranch, enclosedBracketBranch, asteriskBranch)

    export const first: Set<TokenType> = union(TokenType.Identifier, TokenType.LBrace, TokenType.Multiply)
    export function parse(parser: Parser, sync: Set<TokenType>): ParseNode<ParseNodeEnum.ModulePath> {

        return parser.useBranch(
            branch,
            "Expected an identifier, or a '*' or a starting '(' bracket",
            sync //whatever the external sync token happens to be
        )

    }
}

namespace ModulePath {

    export const first: Set<TokenType> = ModuleAtom.first;
    export function parse(parser: Parser, sync: Set<TokenType>): ParseNode<ParseNodeEnum.ModulePath> {

        const paths = [];

        paths.push(
            ModuleAtom.parse(
                parser,
                union(sync, TokenType.Dot)
            )
        );

        while (parser.peek().tokenType === TokenType.Dot) {
            parser.advance();
            paths.push(
                ModuleAtom.parse(
                    parser,
                    union(sync, TokenType.Dot)
                )
            );
        }

        return new ModPath(
            ModPathKind.DotGroup,
            paths
        );
    }
}

export enum ModuleKind {
    Import, Using, Export, GlobalExport
}

export class Module<T extends ModuleKind> extends ParseNode<ParseNodeEnum.Module> {
    constructor(
        public moduleKind: T, 
        public body: 
            T extends ModuleKind.Import ? ParseNode<ParseNodeEnum.ModulePath> :
            T extends ModuleKind.Using ? ParseNode<ParseNodeEnum.ModulePath> :
            ParseNode<ParseNodeEnum.Node>
    ) {
        super(ParseNodeEnum.Module)
    }
}

export function parseImport(parser: Parser, sync: Set<TokenType>) {

    const finish = parser.start()

    const { body } = parser.terminal<{ "body": ParseNode<ParseNodeEnum.ModulePath> }>(
        sync,
        "prod_imp",
        token(TokenType.K_Import, "Expected the keyword import"),
        nterm(ModulePath.parse, ModulePath.first, "body"),
        token(TokenType.Semicolon, "Expected a semicolon token")
    )
    
    return finish(new Module(ModuleKind.Import, body))
}

//* VERIFIED AND CACHED
export function parseUsing(parser: Parser, sync: Set<TokenType>) {

    const finish = parser.start()
    parser.match({
        expected: TokenType.K_Using,
        sync: union(TokenType.Semicolon, sync, ModulePath.first),
        title: "Expected the keyword 'import'"
    })

    const body = ModulePath.parse(
        parser,
        union(sync, TokenType.Semicolon),
    )

    parser.match({
        expected: TokenType.Semicolon,
        sync: sync,
        title: "Expected a semicolon token" //because this is the end token
    })

    return finish(new Module(ModuleKind.Using, body))
}

export function parseExport(parser: Parser, sync: Set<TokenType>) {

    const finish = parser.start()

    parser.match({
        expected: TokenType.K_Export,
        sync: union(sync, First.Node, TokenType.K_Global, TokenType.Semicolon),
        title: "Expected the keyword export"
    })

    let output;

    if ( parser.peek().tokenType == TokenType.K_Global ) {
        parser.advance()
        output = new Module(ModuleKind.Export, parser.parseNode(union(sync, TokenType.Semicolon)))
    } else {
        output = new Module(ModuleKind.GlobalExport, parser.parseNode(union(sync, TokenType.Semicolon)))
    }

    parser.match({
        expected: TokenType.Semicolon,
        sync,
        title: "Expected a semicolon here"
    })

    return finish(output)

}