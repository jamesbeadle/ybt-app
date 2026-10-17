import { performAction } from '$lib/ybt/ybtConnector';
import { parseRecentSteps, type RecentStep } from './recentSteps';

const recentLifecycleAction = 'read_recent_lifecycle';

export async function readRecentSteps(): Promise<RecentStep[]> {
	return parseRecentSteps(await performAction(recentLifecycleAction));
}
