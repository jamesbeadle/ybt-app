const answerShapes = {
	handedOver: /^".*" is built on \S+\. Review task raised for /,
	released: /^Recorded on ".*": released by /,
	setAside: /^Recorded on ".*": considered by /,
	madeBuildable: /^".*": Buildable by /
} as const;

/** YBT's answer once it has taken the branch for review; any other answer is a refusal, raised naming the branch. */
export function confirmedHandOver(answer: string, branch: string): string {
	return confirmed(answer, answerShapes.handedOver, `YBT did not take ${branch} for review`);
}

/** YBT's answer once it has recorded the task as released; any other answer is a refusal. */
export function confirmedRelease(answer: string): string {
	return confirmed(answer, answerShapes.released, 'YBT did not record the task as released');
}

/** YBT's answer once it has set the task aside as needing an infrastructure change; any other answer is a refusal. */
export function confirmedSetAside(answer: string): string {
	return confirmed(answer, answerShapes.setAside, 'YBT did not set the task aside');
}

/** YBT's answer once the next tier may build the task; any other answer is a refusal, raised naming the tier. */
export function confirmedHandUp(answer: string, modelId: string): string {
	return confirmed(answer, answerShapes.madeBuildable, `YBT did not hand the task up to ${modelId}`);
}

function confirmed(answer: string, shape: RegExp, refusalLead: string): string {
	if (shape.test(answer)) return answer;
	throw new Error(`${refusalLead}: ${answer}`);
}
