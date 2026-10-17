export const harnessEventKinds = {
	stepStarted: 'stepStarted',
	outputLine: 'outputLine',
	stepFinished: 'stepFinished',
	finished: 'finished'
} as const;

export type HarnessEvent =
	| { kind: typeof harnessEventKinds.stepStarted; title: string }
	| { kind: typeof harnessEventKinds.outputLine; text: string }
	| { kind: typeof harnessEventKinds.stepFinished; title: string; isPassed: boolean; seconds: number }
	| { kind: typeof harnessEventKinds.finished };

export type HarnessRequest = {
	checkout: string;
	taskText: string;
	model: string;
	lmStudioOrigin: string;
};

export const stepStates = { running: 'running', passed: 'passed', failed: 'failed' } as const;

export type StepState = (typeof stepStates)[keyof typeof stepStates];

export type HarnessStepView = { title: string; state: StepState; seconds: number; lines: string[] };

export const harnessLimits = { longestTaskText: 8000, longestCheckoutPath: 1000 } as const;
