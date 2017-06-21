const TypedPromise = require("../index.js").default;
const { deferred } = require("../lib/adapter");
const assert = require("assert");

const d = deferred();
const promise = d.promise;
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

// d.promise.then(function (v) {
//   console.log("in the promise resolve");
// });
// console.log(d.promise._deferred.length);

// setTimeout(function () {
//   console.log("-------");
//   console.log(d.promise._deferred.length);
//   d.promise.then(function () {
//     console.log("in the settimeout deferred");
//   });
//   console.log(d.promise._deferred.length);
//   console.log("-------");
// }, 50);
// setTimeout(function () {
//   console.log(d.promise._deferred);
//   console.log(d.promise._state);
//   d.resolve("ok");
// }, 100);

//
// const sentinel = { sentinel: "sentinel" };

// promise.then(null, function () {
//   return sentinel;
// }).then(function (value) {
//   console.log(value === sentinel);
// });

// promise.then(null, function () {
//   throw sentinel;
// }).then(null, function (reason) {
//   console.log(reason === sentinel);
// });

// promise.then(null, function () {
//   return sentinel;
// })
// .then(value => {
//   console.log(value === sentinel);
// });

// d.reject("ok");

// const thenable = Object.create(null, {
//   then: {
//     get: function () {
//       return (fulfilled) => {
//         // fulfilled("thenable");
//         // throw new Error("has fulfilled");
//         setTimeout(() => {
//           fulfilled("thenable");
//           // throw new Error("has fulfilled");
//         }, 0);
//       };
//     }
//   }
// });


// const plainObject = { "hello": 2 };

// const sPromise = new TypedPromise(function (resolve) {
//   resolve(plainObject);
// })
// .then(function (v) {
//   console.log(v);
//   return thenable;
// })
// .then(function (v) {
//   console.log(v);
// });

// const sPromise2 = new Promise(function (resolve) {
//   resolve(thenable);
// })
// .then(function (v) {
//   console.log(v);
//   return thenable;
// })
// .then(function (v) {
//   console.log(v);
// });
// let called = false;

// 2.3.3.3.1
// const thenable = {
//   then: function (fulfilled) {
//     setTimeout(() => {
//       fulfilled("thenable");
//     }, 0);
//   }
// };
// const outerThenableFactory = function (value) {
//   return {
//     then: function (fulfilled) {
//       fulfilled(value);
//       throw value;
//     }
//   }
// }
// promise.then(function (v1) {
//   // return thenable;
//   return outerThenableFactory(thenable);
// })
//   .then(function (v) {
//     console.log("in the typedpromise");
//     console.log(v);
//   }, function (reason) {
//     console.log("in the rejected");
//     console.log(reason);
//   });

// d.resolve("ok");

// Promise.resolve("ok")
//   .then(function (v1) {
//     return outerThenableFactory(thenable);
//   })
//   .then(function (v) {
//     console.log("in the standard promise");
//     console.log(v);
//   }, function (r) {
//     console.log(r);
//   });

// const yFactory = function (value) {
//   return {
//     then: function () {
//       throw value;
//     }
//   }
// };

// const yFactoryAccessor = function (value) {
//   return Object.create(null,
//     {
//       then: {
//         get: function () {
//           throw value;
//         }
//       }
//     }
//   );
// };

// const xFactory = function (value) {
//   return {
//     then: function (resolvePromise) {
//       resolvePromise(value);
//     }
//   }
// };

// promise.then(function () {
//   return xFactory(yFactoryAccessor("ok"));
// })
//   .then(function (v) {
//     console.log(v);
//   }, function (r) {
//     console.log("in the typed promise");
//     console.log(r);
//   });

// d.resolve("ok");

// Promise.resolve("ok")
//   .then(function () {
//     return xFactory(yFactoryAccessor("ok"));
//   })
//   .then(function (v) {
//     console.log(v);
//   }, function (r) {
//     console.log("in the standard promise");
//     console.log(r);
//   });

const xFactory = function (value) {
  return {
    then: function (resolvePromise, rejectPromise) {
      rejectPromise(value);
      throw other;
    }
  };
}

promise.then(function () {
  return xFactory("test reject");
})
  .then(function (v) {
    console.log(v);
  }, function (r) {
    console.log("in the typed promise");
    console.log(r);
  });

d.resolve("ok");

Promise.resolve("ok")
  .then(function () {
    return xFactory("test reject");
  })
  .then(function (v) {
    console.log(v);
  }, function (r) {
    console.log("in the standard promise");
    console.log(r);
  });