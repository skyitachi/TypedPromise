"use strict";
exports.__esModule = true;
var index_1 = require("../index");
function resolve(value) {
    return new index_1["default"](function (resolve) {
        resolve(value);
    });
}
exports.resolve = resolve;
function reject(reason) {
    return new index_1["default"](function (_, reject) {
        reject(reason);
    });
}
exports.reject = reject;
function deferred() {
    var resolve, reject;
    var promise = new index_1["default"](function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
    });
    return {
        promise: promise,
        resolve: resolve,
        reject: reject
    };
}
exports.deferred = deferred;
