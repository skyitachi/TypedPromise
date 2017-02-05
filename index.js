"use strict";
const asap_1 = require("./lib/asap");
function noop() {
}
let count = 0;
function thenable(x) {
    return x && x.then && x.then instanceof Function;
}
class Deferred {
    constructor(boundedPromise, onFulfilled, onRejected) {
        this.onFulfilled = onFulfilled;
        this.onRejected = onRejected;
        this.promise = boundedPromise;
    }
}
class TypedPromise {
    constructor(executor) {
        this._state = 0 /* PENDING */;
        this._value = null;
        this._reason = null;
        this._deferredState = 0 /* INITIAL */;
        this._deferred = null;
        // test
        this._name = count++;
        this._executor = executor;
        if (executor === noop)
            return;
        TypedPromise.doResolve(this._executor, this);
    }
    then(onFulfilled, onRejected) {
        const ret = new TypedPromise(noop);
        // deal it as deferred
        TypedPromise.handle(this, new Deferred(ret, onFulfilled, onRejected));
        return ret;
    }
    static doResolve(execute, promise) {
        let done = false;
        execute(function (value) {
            if (done)
                return;
            done = true;
            TypedPromise.resolve(promise, value);
        }, function (reason) {
            if (done)
                return;
            done = true;
            TypedPromise.reject(promise, reason);
        });
    }
    // Promise Resolve Procedure
    static resolve(self, value) {
        if (self === value) {
            throw new TypeError("promise cannot resolve self");
        }
        // if value is TypedPromise instance
        if (value instanceof TypedPromise) {
            // Note: should get valuePromise's value to self promise, so you should call another doResolve
            // just like valuePromise.then(function (value) { self.resolve(self, value) })
            // but it will cause construct one more promise
            TypedPromise.doResolve(value.then.bind(value), self);
        }
        else {
            self._state = 1 /* FULFILLED */;
            self._value = value;
            // Note: deal with deferred
            if (self._deferredState === 1 /* RESOLVABLE */) {
                TypedPromise.handle(self, self._deferred);
            }
        }
    }
    static reject(promise, reason) {
        promise._state = 2 /* REJECTED */;
        promise._reason = reason;
    }
    static handleResolved(self, deferred) {
        const cb = deferred.onFulfilled;
        if (cb) {
            // behavior like micro tasks
            asap_1.default(function () {
                // newValue can be promise instance
                const newValue = cb(self._value);
                TypedPromise.resolve(deferred.promise, newValue);
            });
        }
    }
    static handleRejected(self, deferred) {
        const cb = deferred.onRejected;
        if (cb) {
            // behavior like micro tasks
            asap_1.default(function () {
                const reason = cb(self._reason);
                TypedPromise.reject(self, reason);
            });
        }
    }
    static handle(self, deferred) {
        // while(self._state === PromiseState.ADOPTED) {
        //   self = self._value;
        // }
        switch (self._state) {
            case 0 /* PENDING */:
                // Note: stash the deferred, wait for the async task in current promise
                if (self._deferredState === 0 /* INITIAL */) {
                    self._deferredState = 1 /* RESOLVABLE */;
                    self._deferred = deferred;
                }
                break;
            case 1 /* FULFILLED */:
                TypedPromise.handleResolved(self, deferred);
                break;
            case 2 /* REJECTED */:
                TypedPromise.handleRejected(self, deferred);
                break;
            default:
                // unexpected state
                break;
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TypedPromise;
