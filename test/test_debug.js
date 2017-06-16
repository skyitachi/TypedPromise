const TypedPromise = require("../index.js").default;
const { deferred } = require("../lib/adapter");
const assert = require("assert");

// const tp = new TypedPromise(function (resolve, reject) {
//   reject("ok");
// });
// tp.then(function () { }, function (reason) {
//   assert(reason === "ok");
//   console.log(reason);
// });

// const VALUE = "OK";
// const p = new TypedPromise(function (resolve) {
//   resolve(VALUE);
// });
// p
//   .then("onFulfilled", "onReject")
//   .then(function (value) {
//     try {
//       assert(value === VALUE);
//     } catch (err) {
//       console.log(err);
//     }
//     console.log(value);
//   });

const d = deferred();
console.log(d.promise._deferred.length);
d.promise.then(function (v) {
  console.log("in the promise resolve");
});
console.log(d.promise._deferred.length);

setTimeout(function () {
  console.log("-------");
  console.log(d.promise._deferred.length);
  d.promise.then(function () {
    console.log("in the settimeout deferred");
  });
  console.log(d.promise._deferred.length);
  console.log("-------");
}, 50);
setTimeout(function () {
  console.log(d.promise._deferred);
  console.log(d.promise._state);
  d.resolve("ok");
}, 100);