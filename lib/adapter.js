"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
function resolve(value) {
    return new index_1.default(function (resolve) {
        resolve(value);
    });
}
exports.resolve = resolve;
function reject(reason) {
    return new index_1.default(function (_, reject) {
        reject(reason);
    });
}
exports.reject = reject;
function deferred() {
    let resolve, reject;
    const promise = new index_1.default(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
    });
    return {
        promise,
        resolve,
        reject
    };
}
exports.deferred = deferred;
