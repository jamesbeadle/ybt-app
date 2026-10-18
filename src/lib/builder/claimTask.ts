import { desktopAgentName } from '$lib/chat/systemPrompt';
import { failureText } from '$lib/failures/failureText';
import type { BuildSetup } from './buildAttempt';
import { claimNextTask, releaseBuild } from './builderActions';
import { claimedTaskId, parseClaimedTask, type ClaimedTask } from './claimedTask';

const unreadClaimLead = 'The YBT desktop app could not read this claim, so it gave the task back.';

/** The next task YBT holds for the tier, or null when nothing waits; a claim the builder cannot read is given back first. */
export async function claimTask(setup: BuildSetup): Promise<ClaimedTask | null> {
	const answer = await claimNextTask(setup.tierModelId, desktopAgentName);
	try {
		return parseClaimedTask(answer);
	} catch (failure: unknown) {
		await giveBackUnreadClaim(answer, setup.model, failureText(failure));
		throw failure;
	}
}

async function giveBackUnreadClaim(answer: string, model: string, reason: string): Promise<void> {
	const taskId = claimedTaskId(answer);
	if (taskId === '') return;
	const note = `${unreadClaimLead} ${reason}`;
	await releaseBuild(taskId, desktopAgentName, model, note, '').catch(() => undefined);
}
