/**
 * Created by skyitachi on 2017/2/5.
 */
/// <reference path="../typings/index.d.ts" />

export default function asap(task: () => void):void {
  if (typeof process !== "undefined") {
    process.nextTick(function () {
      task();
    });
  } else {
    setImmediate(function() {
      task();
    });
  }
}

