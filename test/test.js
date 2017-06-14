const assert = require("assert");
const TypedPromise = require("../index.js").default;

describe("2.2.1", function () {

  it("promise.then should resolve value as first promise", function (done) {
    const p = new TypedPromise(function (resolve) {
      resolve("ok");
    });
    const p1 = p.then();
    p1.then(function (value) {
      assert(value === "ok");
      done();
    });
  });

  describe("2.2.1.1 optional onFulfilled and onReject", function () {
    it("promise.then should always return new promise", function () {
      const p = new TypedPromise(function (resolve) {
        resolve("");
      });
      const p1 = p.then();
      assert.equal(p === p1, false);
    });

    it("promise.then should ignore none function onFulfilled, onReject", function (done) {
      const VALUE = "ok";
      const p = new TypedPromise(function (resolve) {
        resolve(VALUE);
      });
      p
        .then("onFulfilled", "onReject")
        .then(function (value) {
          assert(value === VALUE);
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

  it("should catch errors in chain", function (done) {
    Promise
      .resolve("OK")
      .then(function () {
        throw new Error("test");
      })
      .catch(err => {
        assert(err.message === "test");
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

  it("reject synchronously", function (done) {
    const tp = new TypedPromise(function (resolve, reject) {
      reject("ok");
    });
    tp.then(function () { }, function (reason) {
      assert(reason === "ok");
      done();
    });
  });

  it("reject asynchronously", function (done) {
    const tp = new TypedPromise(function (resolve, reject) {
      setTimeout(function () {
        reject("ok");
      }, 0);
    });
    tp.then(function () { }, function (reason) {
      assert(reason === "ok");
      done();
    });
  });

  it("promise chain (one then)", function (done) {
    const tp = new TypedPromise(function (resolve) {
      resolve(new TypedPromise(function (resolve) {
        resolve("chain");
      }));
    });
    tp
      .then(function (value) {
        assert(value === "chain");
        done();
      });
  });

  it("promise chain (two then)", function (done) {
    const tp = new TypedPromise(function (resolve) {
      resolve("ok");
    });
    tp
      .then(function () {
        return new TypedPromise(function (resolve) {
          resolve("chain");
        });
      })
      .then(function (value) {
        assert(value === "chain");
        done();
      });
  });

  it("promise return", function (done) {
    const VALUE = "ok";
    const tp = new TypedPromise(function (resolve) {
      resolve(VALUE);
    });
    tp
      .then(function () {
        return VALUE;
      })
      .then(function (v) {
        assert(v === VALUE);
        done();
      });
  });
});
