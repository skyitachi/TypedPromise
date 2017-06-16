import TypedPromise from "../index";

export function resolve(value) {
  return new TypedPromise(function (resolve) {
    resolve(value);
  });
}

export function reject(reason) {
  return new TypedPromise(function (_, reject) {
    reject(reason);
  });
}

export function deferred() {
  let resolve, reject;
  const promise = new TypedPromise(function (_resolve, _reject) {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    promise,
    resolve,
    reject
  };
}