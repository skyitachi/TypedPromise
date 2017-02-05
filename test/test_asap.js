const asap = require("asap");

console.log("in the main loop start");

process.nextTick(function () {
  console.log("in the next tick");
});

setImmediate(function () {
  console.log("in the immediate");
});

setTimeout(function () {
  console.log("in the set time out")
}, 0);


asap(function () {
  console.log("in the asap");
});

console.log("in the main loop end");
