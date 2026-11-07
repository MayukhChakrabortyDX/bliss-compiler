Bliss needs to think of a dedicated type system that the entire language
uses consistently.

We can think of types living in dimensions.

1. Data Types -> As the name suggests, these are types that are simply data.
2. Pointer Types -> These points to some other type
3. Action Types -> These suggests the underlying value has some action
4. Binding Types -> These suggests that we are taking a binding
5. Union Types -> We are enforcing certain data type and action type
6. Allocator Types

which means they can exist as the type generalization.

For example:

```bx

fx add(data a: i32, data b: User) {

}

fx print(action str: Printable) {
    let string: [char] = str.toString(); //toString only exists on Printable action
}

fx mx(bind l: UserBinding) {}

fx addReferences(ptr a: `i32, ptr b: `i32, ptr c: `i32) {
    `c = `a + `b;
}

fx fixedUnions(union<Printable> num: i32) {

}

```

Allocator-deallocator pairs.

Allocation and de-allocation happens very strictly in bliss.
First, you'd need to define a allocator surface

allocator MyAllocator {
    fx new() {

    }

    fx free() {

    }
}

//the above methods are necessary!

Now, when you try to free some pointer in a function:

fx freeSomething(ptr a: [User]) {

    MyAllocator:free(a); //fails.

}

you have to tell the compiler that the pointer 'a' was allocated by MyAllocator in the first place

fx freeSomething(ptr(MyAllocator) a: [User]) {

    MyAllocator:free(a); //now works.

}

This also prevents what we call default de-allocation where you may try to free random bytes
or stack memory. Unless it's allocated by the allocator, it's impossible to deallocate.

I think this increases the egronomics very much without increasing the complexity too much.

I am also thinking about scoped allocation.

```bx

//this is a block
{

    let(scoped) ptr(malloc) user: [User] = malloc:new(sizeof User);
    //auto frees when the scope ends.

}


```

How would a simple printing library look like for bliss?
Let's say a simple function called print.

Maybe we want to start by creating a function for strings only.


```bx

using std.types.String;
using std.alloc.malloc; //use the malloc allocator for now.

surface stdprint {
    fx __ext_print__(ptr str: [char]): void;
} //links to stdprint.o

fx print<allocator: T>(ptr str: [String<T>]): void {

    //we have to convert the str from a bliss string to C string.
    //a bliss string is simply a data structure with a char array and length parameter.

    let(scoped) ptr(malloc) raw_str: [char] = malloc:new( str.len + 1 ); //another byte for the '0'
    
    let i: i32 = 0;

    loop {

        if ( i == str.len ) {
            break;
        }

        [raw_str | i] = str.at(i);
        i++;

    }

    [raw_str | i] = '\0';
    stdprint.__ext_print__(raw_str);

}

export print;

```

so, our target with the type system is to create a consistent and understandable
system that can also encode a lot of information.

The general nomenclature follows:

MODIFIER name : TYPE_SYSTEM

```bx

data RawStr<allocator: T> {
    ptr(T) items: [char];
    data len: i32;
}

action StrActions {
    fx at(data len: i32) : char;
}

bind RawStr<allocation: T> with StrActions as StrBinding {
    fx at(ptr self: [RawStr<T>], data len: i32) : char {
        
        if ( len < self.len ) {
            return [self.items | len];
        }

        return '\0';

    }
}

alias RawStr<allocation: T>::StrBinding as String<allocation: T>;
export global String<allocation: T>;

```

data, ptr, unions, bindings, and so on, generics also has generic bindings.

<allocator: T, data: K, ptr: M, generic(P): S>

```bx

import std.io.print;
import std.types.*;
import std.alloc.malloc;

fx main(): void {
    let(scoped) ptr(malloc) str: [String] = malloc:new(sizeof String, r"Hello World");
    [str].items = malloc:new(11);
    [str.items] = r"Hello World";
    print(str);
}

```