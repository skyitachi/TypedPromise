/**
 * Created by skyitachi on 2017/2/5.
 */
/// <reference path="../typings/index.d.ts" />
"use strict";
function asap(task) {
    if (typeof process !== "undefined") {
        process.nextTick(function () {
            task();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = asap;
