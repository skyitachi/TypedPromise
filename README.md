### Introduction

- Promise/A+ implementation based on Typescript, support more type inference ablity

#### claims
- In `Promises/A+` 2.2.1 `onFulfilled` and `onRejected` needs check, but in typescript, type check would work static.
In other words, no need to check the type. However, in compiled javascript, *it will cause error*, *this library just for
typescript use*.

- pass all tests by [promises-tests](https://github.com/promises-aplus/promises-tests)

#### TODO
- [x] all errors happened in then handlers should bubble up and can be catchable
- [ ] clean code

