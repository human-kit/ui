declare module '*.svelte' {
  import type { Component } from 'svelte';
  const component: Component;
  export default component;
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare global {
  namespace App {
    interface Error { }
    interface Locals { }
    interface PageData { }
    interface Platform { }
  }
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export { };
