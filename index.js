"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asap_1 = require("./lib/asap");
const util_1 = require("./lib/util");
const debug_1 = require("debug");
const unbounded = Symbol("unbounded");
const resolveCallMap = new Map();
const rejectCallMap = new Map();
const inThenChain = new Map();
const resolveErrorMap = new Map();
let count = 0;
const d = debug_1.default("promise");
function noop() { }
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
        this._deferred = []; // Note: multiple then will cause multiple deferreds 
        this._id = count++;
        this._executor = executor;
        if (executor === noop)
            return;
        doResolve(this._executor, this);
    }
    then(onFulfilled, onRejected) {
        const ret = new TypedPromise(noop);
        // deal it as deferred
        handle(this, new Deferred(ret, onFulfilled, onRejected));
        return ret;
    }
}
exports.default = TypedPromise;
function doResolve(execute, promise) {
    let done = false;
    d("in the doResolve: ", promise._id);
    execute(function (value) {
        if (done)
            return;
        done = true;
        d("in the execute");
        resolveCallMap.set(execute, 2 /* CALLED */);
        resolve(promise, value);
    }, function (reason) {
        if (done)
            return;
        done = true;
        rejectCallMap.set(execute, 2 /* CALLED */);
        reject(promise, reason);
    });
}
// Promise Resolve Procedure
function resolve(self, value) {
    // if (resolveCallMap.get(value) === ResolveCallState.BEFORE_CALL) {
    //   // doResolve -> resolve
    //   resolveCallMap.set(value, ResolveCallState.CALLED);
    // }
    // d("in the resolve: ", value, resolveCallMap.get(self), self._id);
    if (self === value) {
        throw new TypeError("promise cannot resolve self");
    }
    let boundedThen = unbounded;
    if (!util_1.isObject(value)) {
        self._state = 1 /* FULFILLED */;
        self._value = value;
        d("resolved: ", value, self._id);
    }
    else {
        // specification 2.3.3.1
        // if value is TypedPromise instance
        try {
            const then = util_1.getThen(value);
            // Note: should get valuePromise's value to self promise, so you should call another doResolve
            // just like valuePromise.then(function (value) { self.resolve(self, value) })
            // but it will cause construct one more promise
            if (util_1.isFunction(then)) {
                boundedThen = then.bind(value);
                d("from the resolve");
                // inThenChain.set(value, true);
                resolveCallMap.set(boundedThen, 1 /* BEFORE_CALL */);
                // if (resolveCallMap.get(value) !== ResolveCallState.CALLED) {
                // }
                doResolve(boundedThen, self);
                // 判断
                return;
            }
            else {
                self._state = 1 /* FULFILLED */;
                self._value = value;
            }
        }
        catch (error) {
            if (rejectCallMap.get(boundedThen) === 2 /* CALLED */)
                return;
            d("reject call state:", rejectCallMap.get(boundedThen));
            if (boundedThen === unbounded) {
                self._state = 2 /* REJECTED */;
                self._reason = error;
            }
            else if (resolveCallMap.get(boundedThen) === 1 /* BEFORE_CALL */) {
                d("resolve call state: ", resolveCallMap.get(boundedThen), self._id);
                self._state = 2 /* REJECTED */;
                self._reason = error;
            }
            // if (!resolveCallMap.has(value) || resolveCallMap.get(value) === ResolveCallState.BEFORE_CALL) {
            // }
            // else if (inThenChain.get(self)) {
            //   self._state = PromiseState.REJECTED;
            //   self._reason = error;
            // }
            d("in the error: ", self._state);
            // if onFulfilled doesn't invoke， should reject the error
            // self._state = PromiseState.REJECTED;
            // self._reason = error;
            // doResolve exception should ignore if promise resolved or rejected
            // if (self._state === PromiseState.PENDING) {
            // }
        }
    }
    if (self._state !== 0 /* PENDING */
        && self._deferredState === 1 /* RESOLVABLE */) {
        self._deferred.forEach(function (deferred) {
            handle(self, deferred);
        });
        self._deferred = [];
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
    const cb = deferred.onFulfilled;
    if (cb && util_1.isFunction(cb)) {
        // behavior like micro tasks
        asap_1.default(function () {
            try {
                // newValue can be promise instance
                const newValue = cb(self._value);
                d("call deferred");
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
    const cb = deferred.onRejected;
    if (cb && util_1.isFunction(cb)) {
        // behavior like micro tasks
        asap_1.default(function () {
            try {
                const newReason = cb(self._reason);
                // if onReject normally return,
                // will make the defferred promise resolvable
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
