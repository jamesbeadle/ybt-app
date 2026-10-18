import { failureText } from '$lib/failures/failureText';

/** Where the fault lies when a build stops: in the task as YBT records it, in this computer's set-up, or in the model's work. */
export const buildStages = { task: 'task', machine: 'machine', work: 'work' } as const;

export type BuildStage = (typeof buildStages)[keyof typeof buildStages];

/** Why a build could not start, and where its fault lies, as the app's shell refuses it. */
export type BuildRefusal = { reason: string; stage: BuildStage };

const knownStages: readonly string[] = Object.values(buildStages);

/** The shell's refusal as it was sent, or any other failure as a fault on this computer, in words the person can read. */
export function buildRefusal(failure: unknown): BuildRefusal {
	if (isBuildRefusal(failure)) return failure;
	return { reason: failureText(failure), stage: buildStages.machine };
}

function isBuildRefusal(failure: unknown): failure is BuildRefusal {
	const isObject = failure instanceof Object;
	if (!isObject) return false;
	const { reason, stage } = failure as Partial<BuildRefusal>;
	const hasReason = typeof reason === 'string';
	return hasReason && knownStages.includes(stage ?? '');
}
