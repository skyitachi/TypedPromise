"use strict";
exports.__esModule = true;
var asap_1 = require("./lib/asap");
var util_1 = require("./lib/util");
function noop() { }
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
        this._state = 0 /* PENDING */;
        this._value = null;
        this._reason = null;
        this._deferredState = 0 /* INITIAL */;
        this._deferred = []; // Note: multiple then will cause multiple deferreds 
        this._executor = executor;
        if (executor === noop)
            return;
        doResolve(this._executor, this);
    }
    TypedPromise.prototype.then = function (onFulfilled, onRejected) {
        var ret = new TypedPromise(noop);
        // deal it as deferred
        handle(this, new Deferred(ret, onFulfilled, onRejected));
        return ret;
    };
    return TypedPromise;
}());
exports["default"] = TypedPromise;
function doResolve(execute, promise) {
    var done = false;
    execute(function (value) {
        if (done)
            return;
        done = true;
        resolve(promise, value);
    }, function (reason) {
        if (done)
            return;
        done = true;
        reject(promise, reason);
    });
}
// Promise Resolve Procedure
function resolve(self, value) {
    if (self === value) {
        throw new TypeError("promise cannot resolve self");
    }
    // if value is TypedPromise instance
    if (value instanceof TypedPromise) {
        // Note: should get valuePromise's value to self promise, so you should call another doResolve
        // just like valuePromise.then(function (value) { self.resolve(self, value) })
        // but it will cause construct one more promise
        doResolve(value.then.bind(value), self);
    }
    else {
        self._state = 1 /* FULFILLED */;
        self._value = value;
        // Note: deal with deferred
        if (self._deferredState === 1 /* RESOLVABLE */) {
            self._deferred.forEach(function (deferred) {
                handle(self, deferred);
            });
            self._deferred = [];
        }
    }
}
function reject(self, reason) {
    self._state = 2 /* REJECTED */;
    self._reason = reason;
    if (self._deferredState === 1 /* RESOLVABLE */) {
        self._deferred.forEach(function (deferred) {
            handle(self, deferred);
        });
        self._deferred = [];
    }
}
function handleResolved(self, deferred) {
    var cb = deferred.onFulfilled;
    if (cb && util_1.isFunction(cb)) {
        // behavior like micro tasks
        asap_1["default"](function () {
            try {
                // newValue can be promise instance
                var newValue = cb(self._value);
                resolve(deferred.promise, newValue);
            }
            catch (error) {
                // TODO how make error catchable;
                reject(deferred.promise, error);
            }
        });
    }
    else {
        // deferred no onFulfilled should resolve(deferred.promise, self._value)
        resolve(deferred.promise, self._value);
    }
}
function handleRejected(self, deferred) {
    var cb = deferred.onRejected;
    if (cb && util_1.isFunction(cb)) {
        // behavior like micro tasks
        asap_1["default"](function () {
            try {
                var newReason = cb(self._reason);
                resolve(deferred.promise, newReason);
            }
            catch (error) {
                reject(deferred.promise, error);
            }
        });
    }
    else {
        // same as line 115
        reject(deferred.promise, self._reason);
    }
}
function handle(self, deferred) {
    // while(self._state === PromiseState.ADOPTED) {
    //   self = self._value;
    // }
    switch (self._state) {
        case 0 /* PENDING */:
            // Note: stash the deferred, wait for the async task in current promise
            if (self._deferredState === 0 /* INITIAL */) {
                self._deferredState = 1 /* RESOLVABLE */;
                self._deferred.push(deferred);
            }
            else if (self._deferredState === 1 /* RESOLVABLE */) {
                self._deferred.push(deferred);
            }
            break;
        case 1 /* FULFILLED */:
            handleResolved(self, deferred);
            break;
        case 2 /* REJECTED */:
            handleRejected(self, deferred);
            break;
        default:
            // unexpected state
            break;
    }
}
