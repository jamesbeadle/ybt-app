export const stepEventKinds = {
	stepStarted: 'stepStarted',
	outputLine: 'outputLine',
	stepFinished: 'stepFinished',
	finished: 'finished'
} as const;

/** What the app's shell reports while it runs a sequence of steps, one event at a time. */
export type StepEvent =
	| { kind: typeof stepEventKinds.stepStarted; title: string }
	| { kind: typeof stepEventKinds.outputLine; text: string }
	| { kind: typeof stepEventKinds.stepFinished; title: string; isPassed: boolean; seconds: number }
	| { kind: typeof stepEventKinds.finished };

export const stepStates = { running: 'running', passed: 'passed', failed: 'failed' } as const;

export type StepState = (typeof stepStates)[keyof typeof stepStates];

export type StepView = { title: string; state: StepState; seconds: number; lines: string[] };
