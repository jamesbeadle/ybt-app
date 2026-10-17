import { performAction } from '$lib/ybt/ybtConnector';
import { parseBuildQueue, type BuildQueue } from './buildQueue';

const buildQueueAction = 'read_build_queue';

export async function readBuildQueue(): Promise<BuildQueue> {
	return parseBuildQueue(await performAction(buildQueueAction));
}
