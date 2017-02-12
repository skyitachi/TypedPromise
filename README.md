### Introduction

- Promise/A+ implementation based on Typescript, support more type inference ability

#### claims
- In `Promises/A+` 2.2.1 `onFulfilled` and `onRejected` needs check, but in typescript, type check would work static.
In other words, no need to check the type. However, in compiled javascript, *it will cause error*, *this library just for
typescript use*.

#### TODO
- all errors happened in then handlers should bubble up and can be catchable

