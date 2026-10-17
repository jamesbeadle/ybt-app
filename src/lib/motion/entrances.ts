import { prefersReducedMotion } from 'svelte/motion';
import type { FadeParams, FlyParams } from 'svelte/transition';

const rise = 6;
const durations = { page: 180, row: 160, fade: 200 };
const still = { duration: 0 };

function entrance(duration: number): FlyParams {
	if (prefersReducedMotion.current) return still;
	return { y: rise, duration };
}

export function pageEntrance(): FlyParams {
	return entrance(durations.page);
}

export function rowEntrance(): FlyParams {
	return entrance(durations.row);
}

export function fadeEntrance(): FadeParams {
	if (prefersReducedMotion.current) return still;
	return { duration: durations.fade };
}
