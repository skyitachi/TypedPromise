/**
 * The Promise Resolution Procedure
 */
function noop() {
}

function thenable(x) {
  return x && x.then && x.then instanceof Function;
}

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
  private _defaultResolver = _ => {
  };
  private _defaultRejecter = _ => {
  };
  private _state = PromiseState.PENDING;
  private _value = null;
  private _reason = null;
  private _deferredState = DeferredState.INITIAL;
  private _deferred = null;

  constructor(executor: Function) {
    this._executor = executor;
    TypedPromise.doResolve(this._executor, this);
  }

  public then(onFulfilled ?: any, onRejected ?: any) {
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
    // if value is thenable
    if (thenable(value)) {

    } else { // value it not object or function
      self._state = PromiseState.FULFILLED;
      self._value = value;
    }
  }

  private static reject(promise: TypedPromise, reason: any) {
    promise._state = PromiseState.REJECTED;
    promise._reason = reason;
  }

  private static handleResolved(self: TypedPromise, deferred: Deferred) {
    const cb = deferred.onFulfilled;
    if (cb) {
      const newValue = cb(self._value);
      TypedPromise.resolve(deferred.promise, newValue);
    }
  }

  private static handleRejected(self: TypedPromise, deferred: Deferred) {
    const cb = deferred.onRejected;
    if (cb) {
      const reason = cb(self._reason);
      TypedPromise.reject(self, reason);
    }
  }

  private static handle(self: TypedPromise, deferred: Deferred) {
    switch (self._state) {
      case PromiseState.PENDING:
        // TODO
        break;
      case PromiseState.FULFILLED:
        TypedPromise.handleResolved(self, deferred);
        break;
      case PromiseState.REJECTED:
        TypedPromise.handleRejected(self, deferred);
        break;

    }
  }
}

