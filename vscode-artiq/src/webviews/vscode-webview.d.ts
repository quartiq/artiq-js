interface VsCodeApi {
  postMessage(message: any): void;
  getState<T = any>(): T | undefined;
  setState<T = any>(state: T): void;
}

declare function acquireVsCodeApi(): VsCodeApi;