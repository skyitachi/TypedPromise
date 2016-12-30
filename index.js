"use strict";
/**
 * The Promise Resolution Procedure
 */
function noop() {
}
function thenable(x) {
    return x && x.then && x.then instanceof Function;
}
var Deferred = (function () {
    function Deferred(boundedPromise, onFulfilled, onRejected) {
        this.onFulfilled = onFulfilled;
        this.onRejected = onRejected;
        this.promise = boundedPromise;
    }
    return Deferred;
}());
var TypedPromise = (function () {
    function TypedPromise(executor) {
        this._defaultResolver = function (_) {
        };
        this._defaultRejecter = function (_) {
        };
        this._state = 0 /* PENDING */;
        this._value = null;
        this._reason = null;
        this._deferredState = 0 /* INITIAL */;
        this._deferred = null;
        this._executor = executor;
        TypedPromise.doResolve(this._executor, this);
    }
    TypedPromise.prototype.then = function (onFulfilled, onRejected) {
        var ret = new TypedPromise(noop);
        // deal it as deferred
        TypedPromise.handle(this, new Deferred(ret, onFulfilled, onRejected));
        return ret;
    };
    TypedPromise.doResolve = function (execute, promise) {
        var done = false;
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
    };
    // Promise Resolve Procedure
    TypedPromise.resolve = function (self, value) {
        if (self === value) {
            throw new TypeError("promise cannot resolve self");
        }
        // if value is thenable
        if (thenable(value)) {
        }
        else {
            self._state = 1 /* FULFILLED */;
            self._value = value;
        }
    };
    TypedPromise.reject = function (promise, reason) {
        promise._state = 2 /* REJECTED */;
        promise._reason = reason;
    };
    TypedPromise.handleResolved = function (self, deferred) {
        var cb = deferred.onFulfilled;
        if (cb) {
            var newValue = cb(self._value);
            TypedPromise.resolve(deferred.promise, newValue);
        }
    };
    TypedPromise.handleRejected = function (self, deferred) {
        var cb = deferred.onRejected;
        if (cb) {
            var reason = cb(self._reason);
            TypedPromise.reject(self, reason);
        }
    };
    TypedPromise.handle = function (self, deferred) {
        switch (self._state) {
            case 0 /* PENDING */:
                // TODO
                break;
            case 1 /* FULFILLED */:
                TypedPromise.handleResolved(self, deferred);
                break;
            case 2 /* REJECTED */:
                TypedPromise.handleRejected(self, deferred);
                break;
        }
    };
    return TypedPromise;
}());
exports.__esModule = true;
exports["default"] = TypedPromise;
