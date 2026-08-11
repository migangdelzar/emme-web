declare module 'bun:test' {
  export const afterEach: (handler: () => void) => void;
  export const describe: (name: string, handler: () => void) => void;
  export const expect: any;
  export const it: (name: string, handler: () => void | Promise<void>) => void;
}
