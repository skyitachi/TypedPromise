
export function isFunction(f) {
  return typeof f === "function";
}

export function isObject(o) {
  const type = typeof o;
  return o !== null && (type === "object" || type === "function");
}

export function isNull(o) {
  return typeof o === "object" && !o; 
}

export function isThenable(o) {
  return o && o.then && isFunction(o.then);
}

export function getThen(thenable) {
  return thenable.then;
}