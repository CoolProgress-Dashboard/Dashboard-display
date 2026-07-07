declare module 'd3';
declare module 'topojson-client';

declare module 'svelte' {
  export function onMount<T>(fn: () => Promise<T>): void;
}
