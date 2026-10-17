import { readHarnessCheckout } from '$lib/desktopStore';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => ({ checkout: await readHarnessCheckout() });
