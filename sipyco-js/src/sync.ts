export type Done<T = void> = PromiseWithResolvers<T>["resolve"];

export const wait = <T = void>(): {
  wait: Promise<T>;
  done: Done<T>;
} => {
  const { promise: wait, resolve: done } = Promise.withResolvers<T>();
  return { wait, done };
};
