import { desktopAgentName } from '$lib/chat/systemPrompt';
import { renewClaim } from './builderActions';

const minutesBetweenRenewals = 60;
const millisecondsPerMinute = 60_000;
const renewalInterval = minutesBetweenRenewals * millisecondsPerMinute;

/**
 * Keeps YBT's claim on the task while its build runs past the lease. The stop it returns waits for any renewal still
 * on its way, so none lands after the build's own last step and claims the task again.
 */
export function keepClaim(taskId: string, model: string): () => Promise<void> {
	let lastRenewal: Promise<unknown> = Promise.resolve();
	const timer = setInterval(() => {
		lastRenewal = renewClaim(taskId, desktopAgentName, model).catch(() => undefined);
	}, renewalInterval);
	return async () => {
		clearInterval(timer);
		await lastRenewal;
	};
}
