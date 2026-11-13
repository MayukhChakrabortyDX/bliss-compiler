import { TokenType } from "../../lexer/tokens";
import type { Parser } from "../parser";
import { AST, ASTEnum } from "../rules/ast";
import { union } from "./union";
import { BranchEntity, EntityKind, MaybeEntity, ProductionEntity, TokenEntity } from "./entity";

type finishType = <K extends ASTEnum, T extends AST<K>>(node: T, offset?: number) => T;

export class ProductionInstance {

    callback: (...args: any[]) => any = () => { }
    constructor(public first: Set<TokenType>, public run: (parser: Parser, sync: Set<TokenType>) => { args: any[], finish: finishType }) { }

    ast(callback: (finish: finishType, ...args: any[]) => any) {
        this.callback = callback
        return this
    }

    execute(parser: Parser, sync: Set<TokenType>) {
        let runner = this.run(parser, sync)
        const val = this.callback(runner.finish, ...runner.args)
        return val
    }

}

export function production(...tokens: (TokenEntity | ProductionEntity)[]) {

    //takes an array of tokens and processes the output.
    //we will NOT implement any sort of caching just yet. We will wait it out.

    //step 1 - create the sync step.
    for (let index = tokens.length - 2; index >= 0; index--) {

        const now = tokens[index] as (TokenEntity | ProductionEntity)
        const next = tokens[index + 1] as (TokenEntity | ProductionEntity)

        now.syncs_with = union(next.token, next.syncs_with)
    }

    //step 2 - construct the production function - executed with syncs

    const execute = (parser: Parser, sync: Set<TokenType>) => {

        const args: any[] = []

        const finish = parser.span_start()
        for (let item of tokens) {

            const token = parser.peek()

            if (item.save_result) {

                if (item.kind == EntityKind.TOKEN) {

                    parser.match({
                        expected: (item as TokenEntity).token,
                        sync: union(sync, item.syncs_with),
                        title: (item as TokenEntity).error
                    })

                    args.push(token)

                } else {
                    args.push(
                        (item as ProductionEntity).method(parser, sync)
                    )
                }

            } else {

                if (item.kind == EntityKind.TOKEN) {
                    parser.match({
                        expected: (item as TokenEntity).token,
                        sync: union(sync, item.syncs_with),
                        title: (item as TokenEntity).error
                    })
                } else {
                    (item as ProductionEntity).method(parser, sync);
                }

            }

        }

        return { args, finish }

    }

    return new ProductionInstance(
        union((tokens[0] as TokenEntity).token as TokenType),
        execute,
    )

}

export function token(token: TokenType) {
    return new TokenEntity(token)
}

export function nterm(production: ProductionInstance) {
    return new ProductionEntity(
        production.first,
        (parser, sync) => production.execute(parser, sync)
    )
}

export function loop(
    { prod, separator, deliminator, allowEmpty = true }:
        { prod: ProductionEntity, separator?: TokenEntity, deliminator: TokenEntity, allowEmpty?: boolean }
) {

    const method = (parser: Parser, sync: Set<TokenType>) => {

        const items: any[] = []
        let loopSync;

        if (separator != undefined) {
            loopSync = union(sync, prod.token, deliminator.token, separator.token)
        } else {
            loopSync = union(sync, prod.token, deliminator.token)
        }



        //this means we can have empty components
        if (parser.peek().tokenType == deliminator.token) {
            const token = parser.peek()
            parser.consume()

            if (!allowEmpty) {

                //this is an error!
                parser.report("This list must not be empty", token)

            }

            return items
        }



        //otherwise we will start with a single production match
        const firstProduction = production(prod.save()).ast((_, item) => items.push(item))
        firstProduction.execute(parser, loopSync)

        let loopProduction;

        if (separator != undefined) {
            loopProduction = production(
                separator,
                prod.save()
            ).ast((_, item) => items.push(item))
        }

        while (true) {

            //now we are going to handle errors.

            const token = parser.peek()

            if (token.tokenType == deliminator.token) {
                parser.consume()
                return items
            }

            if (token.wasSyncedTo) {

                if (separator != undefined) {

                    if (token.tokenType != separator.token && !prod.token.has(token.tokenType)) {

                        //if it's neither a separator or a production first token or even a delim
                        //that means we return. This is the end stage
                        return items

                    }

                }

                if (!prod.token.has(token.tokenType)) {
                    return items
                }

            }

            if (separator != undefined) {
                loopProduction?.execute(parser, loopSync)
            } else {
                firstProduction.execute(parser, loopSync)
            }

        }

    }

    return new ProductionEntity(
        prod.token,
        method
    )

}

//! UNVERIFIED
export class BranchEmpty extends AST<ASTEnum.EMPTY_BRANCH> {
    constructor() {
        super(ASTEnum.EMPTY_BRANCH)
    }
}

export function branch(
    ...branches: (ProductionEntity | TokenEntity)[]
) {

    //we compute the first tokens and map them basically.
    const branchMap = new Map()
    const first = new Set<TokenType>()

    for (let branch of branches) {
        if (branch.kind == EntityKind.PROD) {

            for (let token of (branch as ProductionEntity).token) {
                //this applies for everyone!
                branchMap.set(token, (branch as ProductionEntity).method)
                first.add(token)

            }
        } else {

            branchMap.set((branch as TokenEntity).token,
                (parser: Parser, sync: Set<TokenType>) => {

                    const _tok = parser.peek()

                    parser.match({
                        expected: (branch as TokenEntity).token,
                        sync,
                        title: (branch as TokenEntity).error
                    })

                    return _tok
                }
            )
            first.add((branch as TokenEntity).token)

        }
    }

    //we computed the branch map, now we will resolve them
    const method = (parser: Parser, sync: Set<TokenType>, instance: BranchEntity) => {

        const token = parser.peek()
        const production = branchMap.get(token.tokenType)

        if (production != undefined) {
            return production(parser, sync)
        }

        parser.syncToken(false, sync, instance.error, token)

        if (parser.peek().tokenType != TokenType.EOF) {
            parser.consume()
        }

        return instance.def

    }

    const branchEntity = new BranchEntity(
        first, (parser, sync) => method(parser, sync, branchEntity)
    )

    return branchEntity

}


export class MaybeEmpty extends AST<ASTEnum.MAYBE_EMPTY> {
    constructor() {
        super(ASTEnum.MAYBE_EMPTY)
    }
}

export function maybe(root: TokenEntity | ProductionEntity) {

    const method = (parser: Parser, sync: Set<TokenType>, instance: MaybeEntity) => {

        const token = parser.peek()

        if (root.kind == EntityKind.PROD) {
            if ((root as ProductionEntity).token.has(token.tokenType)) {
                return (root as ProductionEntity).method(parser, sync)
            }
        }

        if (root.kind == EntityKind.TOKEN) {
            if ((root as TokenEntity).token == token.tokenType) {
                return parser.match({
                    expected: token.tokenType,
                    sync,
                    title: (root as TokenEntity).error
                })
            }
        }

        //otherwise
        return instance.def

    }

    const maybeEntity = new MaybeEntity(
        union(root.token), (parser: Parser, sync: Set<TokenType>) => method(parser, sync, maybeEntity)
    )

    return maybeEntity

}