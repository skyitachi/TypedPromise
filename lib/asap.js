/**
 * Created by skyitachi on 2017/2/5.
 */
/// <reference path="../typings/index.d.ts" />
"use strict";
exports.__esModule = true;
function asap(task) {
    if (typeof process !== "undefined") {
        process.nextTick(function () {
            task();
        });
    }
    else {
        setImmediate(function () {
            task();
        });
    }
}
exports["default"] = asap;
