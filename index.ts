import asap from "./lib/asap";

type CallbackFunction = (any) => any;
function noop() {
}
let count = 0;

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

class Deferred {
  public onFulfilled: Function;
  public onRejected: Function;
  public promise: TypedPromise;

  constructor(boundedPromise: TypedPromise, onFulfilled ?: Function, onRejected ?: Function) {
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;
    this.promise = boundedPromise;
  }
}

export default class TypedPromise {
  private _executor: Function;
  private _state = PromiseState.PENDING;
  private _value = null;
  private _reason = null;
  private _deferredState = DeferredState.INITIAL;
  private _deferred = null;

  constructor(executor: Function) {
    this._executor = executor;
    if (executor === noop) return;
    TypedPromise.doResolve(this._executor, this);
  }

  public then(onFulfilled ?: CallbackFunction, onRejected ?: CallbackFunction): TypedPromise {
    const ret = new TypedPromise(noop);
    // deal it as deferred
    TypedPromise.handle(this, new Deferred(ret, onFulfilled, onRejected));
    return ret;
  }

  private static doResolve(execute: Function, promise: TypedPromise) {
    let done = false;
    execute(function (value) {
      if (done) return;
      done = true;
      TypedPromise.resolve(promise, value);
    }, function (reason) {
      if (done) return;
      done = true;
      TypedPromise.reject(promise, reason);
    });
  }

  // Promise Resolve Procedure
  private static resolve(self: TypedPromise, value: any) {
    if (self === value) {
      throw new TypeError("promise cannot resolve self");
    }
    // if value is TypedPromise instance
    if (value instanceof TypedPromise) {
      // Note: should get valuePromise's value to self promise, so you should call another doResolve
      // just like valuePromise.then(function (value) { self.resolve(self, value) })
      // but it will cause construct one more promise
      TypedPromise.doResolve(value.then.bind(value), self);
    } else { // value is neither object nor function
      self._state = PromiseState.FULFILLED;
      self._value = value;
      // Note: deal with deferred
      if (self._deferredState === DeferredState.RESOLVABLE) {
        TypedPromise.handle(self, self._deferred);
      }
    }
  }

  private static reject(promise: TypedPromise, reason: any) {
    promise._state = PromiseState.REJECTED;
    promise._reason = reason;
    if (promise._deferredState === DeferredState.RESOLVABLE) {
      TypedPromise.handle(promise, promise._deferred);
    }
  }

  private static handleResolved(self: TypedPromise, deferred: Deferred) {
    const cb = deferred.onFulfilled;
    if (cb) {
      // behavior like micro tasks
      asap(function () {
        try {
          // newValue can be promise instance
          const newValue = cb(self._value);
          TypedPromise.resolve(deferred.promise, newValue);
        } catch (error) {
          // TODO how make error catchable;
          TypedPromise.reject(self, error);
        }
      });
    }
  }

  private static handleRejected(self: TypedPromise, deferred: Deferred) {
    const cb = deferred.onRejected;
    if (cb) {
      // behavior like micro tasks
      asap(function () {
        try {
          const reason = cb(self._reason);
          TypedPromise.reject(deferred.promise, reason);
        } catch (err) {
          TypedPromise.reject(self, err);
        }
      });
    }
  }

  private static handle(self: TypedPromise, deferred: Deferred) {
    // while(self._state === PromiseState.ADOPTED) {
    //   self = self._value;
    // }
    switch (self._state) {
      case PromiseState.PENDING:
        // Note: stash the deferred, wait for the async task in current promise
        if (self._deferredState === DeferredState.INITIAL) {
          self._deferredState = DeferredState.RESOLVABLE;
          self._deferred = deferred;
        }
        break;
      case PromiseState.FULFILLED:
        TypedPromise.handleResolved(self, deferred);
        break;
      case PromiseState.REJECTED:
        TypedPromise.handleRejected(self, deferred);
        break;
      default:
        // unexpected state
        break;
    }
  }
}


