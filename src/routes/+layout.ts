import { readSettings } from '$lib/desktopStore';
import type { LayoutLoad } from './$types';

export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = async () => ({ settings: await readSettings() });
