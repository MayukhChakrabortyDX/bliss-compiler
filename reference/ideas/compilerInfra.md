We already have a great tooling and compilation architecture for C/C++
ecosystem.

We can have that as an advantage to make more coherent applications.

The bliss compiler's job is to compile bliss to C only. The rest is actually
the compiler infra job.

But bliss doesn't stop there itself. It also helps in managing this infra
for an end to end application development cycle.

The key idea here is to not eliminate control, but rather the need for manual
management.

Let's say we are making a simple web server using gc backend, because garbage
collection is indeed one of the most important aspects in modern infrastructures.

```bx

import std.memory.gc;

fx gc_main(fn gc: GC) {

    let data someObject: GC<i32> = gc(sizeof i32);
    someObject.set(10);

}

```

Now, at first glace, it might look very strange. But we can
actually use distributed allocator techniques.

For example, we can have a GC data instance that holds some properties
and describe an allocator around that.

```bx

using std.memory.gc.gcsurface;

allocator GC {
    fx new(ptr: [GC], data size: u64): [u8] {
        return gcsurface(ptr, size);
    }
}

```

This allows for a very interesting category of properties - allocators are generalized, meaning
we can allow for a very wide amount of properties with ease.

and this is where the compiler infrastructure comes to play.

in project.toml, we can add a linkable target to gc runtime.

This links the gc_main to a pre-existing high performance GC code that has all the machinery setup
already.