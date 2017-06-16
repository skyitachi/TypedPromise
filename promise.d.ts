interface TypedPromise<T> {
  then<T, never>(onfulfilled: (value: T) => T, onrejected: (reason: any) => any): TypedPromise<T | never>
}