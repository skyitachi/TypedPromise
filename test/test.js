const assert = require("assert");
const TypedPromise = require("../index.js").default;

describe("2.2.1", function () {
  describe("2.2.1.1 optional onFulfilled and onReject", function () {
    it("promise.then() should always return new promise", function () {
      const p = Promise.resolve("");
      const p1 = p.then();
      assert.equal(p === p1, false);
    });

    it("promise.then() should resolve value as first promise", function (done) {
      const p = Promise.resolve("value");
      const p1 = p.then();
      p1.then(function (value) {
        assert(value === "value");
        done();
      });
    });
  });
});

describe("test promise chain", function () {
  it("should resolve promise in chain", function (done) {
    Promise
      .resolve("start")
      .then(function () {
        return Promise.resolve("chain");
      })
      .then(function (ret) {
        assert(ret === "chain");
        done();
      });
  });
});

describe("TypedPromise basic api", function () {
  it("resolve synchronously", function (done) {
    const tp = new TypedPromise(function (resolve) {
      resolve("ok");
    });
    tp.then(function (value) {
      assert(value === "ok");
      done();
    });
  });

  it("resolve asynchronously", function (done) {
    new TypedPromise(function (resolve) {
      setTimeout(function () {
        resolve("OK");
      }, 0);
    })
    .then(function (value) {
      assert(value === "OK");
      done();
    });
  });

  it("reject", function (done) {
    const tp = new TypedPromise(function (resolve, reject) {
      reject("ok");
    });
    tp.then(function () {}, function (reason) {
      assert(reason === "ok");
      done();
    });
  });

  // it("promise chain first", function (done) {
  //   const tp = new TypedPromise(function (resolve, reject) {
  //     resolve(new TypedPromise(function (resolve, reject) {
  //       resolve("chain");
  //     }));
  //   });
  //   tp
  //     .then(function (value) {
  //       assert(value === "chain");
  //       done();
  //     });
  // });

  // it("promise chain", function (done) {
  //   const tp = new TypedPromise(function (resolve, reject) {
  //     resolve("ok");
  //   });
  //   tp
  //     .then(function () {
  //       return new TypedPromise(function (resolve, reject) {
  //         resolve("chain");
  //       });
  //     })
  //     .then(function (value) {
  //       assert(value === "chain");
  //       done();
  //     });
  // });
});
