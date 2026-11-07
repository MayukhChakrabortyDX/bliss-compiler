//argument boundary is what I am saying

(a, b | c, d | e, f)

//for example, say we have a generic:

fx someFunction(cake: T | name: [i32] | primary: MyAllocator) {


}


someFunction(i32 | 32 | myalloc);

This also helps us to take types from surfaces and allocators and much much more!
The regions are unordered, so this makes it even better.

new(myAllocator | User);