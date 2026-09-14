export const validMonster = `
foo
+ 123
+ 123.456
+ "hello world"
+ (alpha)
+ [one]
+ [one | two]
+ #[three]
+ #[three | four]
+ \`foo
+ adrs bar
+ sizeof baz

+ arr[0]
+ matrix[10]
+ callback(arg1, arg2)
+ callback()
+ nested(foo(1, 2), bar[3])
+ a::b
+ a::b::c
+ a::b->c
+ a::b->c::d->e

+ object.field
+ object.field->method
+ a->b.c->d.e

+ a * b
+ a / b
+ a * b / c * d

+ a + b
+ a - b
+ a + b - c + d

+ a < b
+ a > b
+ a <= b
+ a >= b
+ a < b > c <= d >= e

+ a == b
+ a != b
+ a == b != c == d

+ a = b
+ a = b = c
+ a == b = c

+ (
    foo
    + 123
    * bar
)

+ (
    a::b
    -> c.d
    * (
        x + y
    )
)

+ array[
    0
]

+ function(
    first,
    second,
    third(
        nested,
        values[42]
    )
)

+ #[alpha | beta]

+ adrs \`sizeof \`pointer

+ (
    root
    -> child::grandchild
    .field
    -> method(
        arg1,
        arg2[10],
        #[x | y]
    )
)

+ (
    a::b->c.d(
        x,
        y
    )
    *
    (
        p + q / r
    )
    -
    s
)

+ (
    first
    ==
    second
)
=
result

+ (
    deeply::nested::binding
    ->
    chain::withx::many::parts
    ->
    final
    .
    property
    .
    another
)

+ call(
    a::b->c.d(
        [1 | 2],
        #[3 | 4],
        \`value,
        adrs target,
        sizeof object
    )
)

+ (
    alpha[0]
    + beta[1]
    - gamma[2]
    * delta[3]
    / epsilon[4]
)

+ (
    a < b
    == c != d
    = e
)

+ (
    (
        (
            (
                (
                    identifier
                )
            )
        )
    )
)

+ [
    (
        a + b
    )
    |
    (
        c * d
    )
]

+ #[
    foo->bar.baz
    |
    adrs \`pointer
]

+ sizeof (
    alpha
)

+ adrs (
    target
)

+ \`(
    value
)

+ mega(
    a::b->c.d(
        x[1],
        y[2],
        z[3]
    ),
    #[one | two],
    [three | four],
    sizeof \`thing,
    adrs target
)
`;