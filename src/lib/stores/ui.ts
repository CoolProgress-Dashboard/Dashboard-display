import { writable } from 'svelte/store';

/** Controls the PillarModal visibility from any pillar component */
export const pillarModalOpen = writable(false);
