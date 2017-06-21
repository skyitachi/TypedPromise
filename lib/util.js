"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isFunction(f) {
    return typeof f === "function";
}
exports.isFunction = isFunction;
function isObject(o) {
    const type = typeof o;
    return o !== null && (type === "object" || type === "function");
}
exports.isObject = isObject;
function isNull(o) {
    return typeof o === "object" && !o;
}
exports.isNull = isNull;
function isThenable(o) {
    return o && o.then && isFunction(o.then);
}
exports.isThenable = isThenable;
function getThen(thenable) {
    return thenable.then;
}
exports.getThen = getThen;
