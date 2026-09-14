export const recoveryMonster = `
foo(
    123,
    456.789,
    "unterminated-ish",
    alpha[10],
    gamma
    + delta
    * epsilon
    / zeta
    < eta
    == theta
    = iota,

    broken::binding::x->magnet.
    another::valid->expression.field,

    [one | two+
    #[three | four
    [10]]],

    arr[10]+
    matrix[20][30].
    fn(
        a,
        b,
        c[3
        d(
            e,
            f
        )

    sizeof
    adrs
    \`broken

    x->y->z
    x->->broken
    x::::broken
    x...broken

    validAfterChaos(
        one,
        two,
        three[3]
    )

    (
        nested
        + expression
        * still
        / valid
    ]

    missing(
        a,
        b,
        c

    sibling(
        x,
        y
    )

    foo(
        bar(
            baz(
                qux(
                    value
                )
            )
        )

    alpha + beta - gamma * delta / epsilon
    <
    something == another != third

    broken = = assignment

    valid::binding->magnet.field(
        good,
        expression[42]
    )

    [
        one
        |
        two
    ]

    #[
        three
        |
        four
    ]

    adrs \`pointer
    sizeof object

    (
        a::b->c.d(
            x,
            y
        )
    )

    anotherBroken(
        missing,
        comma
        here
        still,
        valid
    )

    a[1][2][3][4

    call(
        first,
        second(
            nested,
            deeper[
                10
            ]
        ),
        third
    )

    x < y <= z >= q > r
    a == b != c == d
    result = something = else

    (
        (
            (
                broken
            )
        ]

    afterNestedError::thisShouldStillBeFound

    foo.bar.baz.qux(
        one,
        two,
        three
    )

    [valid | array]

    #[valid | hashLike]

    \`validAtom

    sizeof \`anotherAtom

    adrs target

    catastrophic(
        a::b->c.d(
            x[1],
            y[2
            z(
                q,
                r,
                s
            )
        ),
        #[foo | bar],
        [baz | qux],
        sizeof \`ptr
    ]

    THIS_IS_A_RECOVERY_POINT

    (
        valid
        +
        expression
    )

    missingClosingCall(
        a,
        b,
        c

    NEXT_VALID_EXPRESSION(
        x,
        y[100]
    )

    bad::->binding
    good::binding->chain

    another[
        broken
        |
        valid
    ]

    final(
        (
            (
                x + y
            )
        ),
        z
    )

    =
    ==
    !=
    <
    >
    <=
    >=
    +
    -
    *
    /

    trailing(
        chaos(
            more(
                chaos(
                    even_more
                )
            )
        )
    )

    end::of::monster->hopefully.valid.expression
`;