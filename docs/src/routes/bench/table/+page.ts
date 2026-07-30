// The benchmark measures client-side interaction cost only; server rendering
// and prerendering would just add noise to the mount scenario.
export const ssr = false;
export const prerender = false;
export const csr = true;
