import { Channel, invoke } from '@tauri-apps/api/core';
import { describeOutputLine } from './claudeStreamLine';
import {
	harnessEventKinds,
	stepStates,
	type HarnessEvent,
	type HarnessRequest,
	type HarnessStepView
} from './harnessEvents';

const runCommand = 'run_harness_test';

/** One run of the local harness test, followed step by step as the app's shell reports it. */
export class HarnessTest {
	steps = $state<HarnessStepView[]>([]);
	isRunning = $state(false);
	problem = $state('');

	async run(request: HarnessRequest): Promise<void> {
		this.steps = [];
		this.problem = '';
		this.isRunning = true;
		const onEvent = new Channel<HarnessEvent>();
		onEvent.onmessage = (event) => this.hear(event);
		await invoke(runCommand, { request, onEvent }).catch((failure) => (this.problem = String(failure)));
		this.isRunning = false;
	}

	private hear(event: HarnessEvent): void {
		if (event.kind === harnessEventKinds.stepStarted) this.startStep(event.title);
		if (event.kind === harnessEventKinds.outputLine) this.addOutput(event.text);
		if (event.kind === harnessEventKinds.stepFinished) this.finishStep(event.isPassed, event.seconds);
	}

	private startStep(title: string): void {
		this.steps.push({ title, state: stepStates.running, seconds: 0, lines: [] });
	}

	private addOutput(text: string): void {
		this.currentStep()?.lines.push(...describeOutputLine(text));
	}

	private finishStep(isPassed: boolean, seconds: number): void {
		const step = this.currentStep();
		if (step === undefined) return;
		step.state = isPassed ? stepStates.passed : stepStates.failed;
		step.seconds = seconds;
	}

	private currentStep(): HarnessStepView | undefined {
		return this.steps.at(-1);
	}
}
