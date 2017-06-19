import asap from "./lib/asap";
import { isFunction } from "./lib/util";

function noop() { }

const enum PromiseState {
  PENDING,
  FULFILLED,
  REJECTED,
  ADOPTED
}

const enum DeferredState {
  INITIAL,
  RESOLVABLE
}

class Deferred<T> {
  public onFulfilled: Function;
  public onRejected: Function;
  public promise: TypedPromise<T>;

  constructor(boundedPromise: TypedPromise<T>, onFulfilled?: Function, onRejected?: Function) {
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;
    this.promise = boundedPromise;
  }
}

interface ExecuteInterface<T> {
  (onFulfilled: (value: T) => void, onRejected: (reason: any) => void): void
}

export default class TypedPromise<T> {
  _executor: ExecuteInterface<T>;
  _state = PromiseState.PENDING;
  _value = null;
  _reason = null;
  _deferredState = DeferredState.INITIAL;
  _deferred = []; // Note: multiple then will cause multiple deferreds 

  constructor(executor: ExecuteInterface<T>) {
    this._executor = executor;
    if (executor === noop) return;
    doResolve(this._executor, this);
  }

  public then(onFulfilled?: Function, onRejected?: Function): TypedPromise<T> {
    const ret = new TypedPromise(noop);
    // deal it as deferred
    handle(this, new Deferred(ret, onFulfilled, onRejected));
    return ret;
  }
}


function doResolve<T>(execute: ExecuteInterface<T>, promise: TypedPromise<T>) {
  let done = false;
  execute(function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  });
}

// Promise Resolve Procedure
function resolve<T>(self: TypedPromise<T>, value: any) {
  if (self === value) {
    throw new TypeError("promise cannot resolve self");
  }
  // if value is TypedPromise instance
  if (value instanceof TypedPromise) {
    // Note: should get valuePromise's value to self promise, so you should call another doResolve
    // just like valuePromise.then(function (value) { self.resolve(self, value) })
    // but it will cause construct one more promise
    doResolve(value.then.bind(value), self);
  } else { // value is neither object nor function
    self._state = PromiseState.FULFILLED;
    self._value = value;
    // Note: deal with deferred
    if (self._deferredState === DeferredState.RESOLVABLE) {
      self._deferred.forEach(function (deferred) {
        handle(self, deferred);
      });
      self._deferred = [];
    }
  }
}

function reject<T>(self: TypedPromise<T>, reason: any) {
  self._state = PromiseState.REJECTED;
  self._reason = reason;
  if (self._deferredState === DeferredState.RESOLVABLE) {
    self._deferred.forEach(function (deferred) {
      handle(self, deferred);
    });
    self._deferred = [];
  }
}

function handleResolved<T>(self: TypedPromise<T>, deferred: Deferred<T>) {
  const cb = deferred.onFulfilled;
  if (cb && isFunction(cb)) {
    // behavior like micro tasks
    asap(function () {
      try {
        // newValue can be promise instance
        const newValue = cb(self._value);
        resolve(deferred.promise, newValue);
      } catch (error) {
        // TODO how make error catchable;
        reject(deferred.promise, error);
      }
    });
  } else {
    // deferred no onFulfilled should resolve(deferred.promise, self._value)
    resolve(deferred.promise, self._value);
  }
}

function handleRejected<T>(self: TypedPromise<T>, deferred: Deferred<T>) {
  const cb = deferred.onRejected;
  if (cb && isFunction(cb)) {
    // behavior like micro tasks
    asap(function () {
      try {
        const newReason = cb(self._reason);
        // if onReject normally return,
        // will make the defferred promise resolvable
        resolve(deferred.promise, newReason);
      } catch (error) {
        reject(deferred.promise, error);
      }
    });
  } else {
    // same as line 115
    reject(deferred.promise, self._reason);
  }
}

function handle<T>(self: TypedPromise<T>, deferred: Deferred<T>) {
  // while(self._state === PromiseState.ADOPTED) {
  //   self = self._value;
  // }
  switch (self._state) {
    case PromiseState.PENDING:
      // Note: stash the deferred, wait for the async task in current promise
      if (self._deferredState === DeferredState.INITIAL) {
        self._deferredState = DeferredState.RESOLVABLE;
        self._deferred.push(deferred);
      } else if (self._deferredState === DeferredState.RESOLVABLE) {
        self._deferred.push(deferred);
      }
      break;
    case PromiseState.FULFILLED:
      handleResolved(self, deferred);
      break;
    case PromiseState.REJECTED:
      handleRejected(self, deferred);
      break;
    default:
      // unexpected state
      break;
  }
}