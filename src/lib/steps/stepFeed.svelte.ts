import { Channel } from '@tauri-apps/api/core';
import { describeOutputLine } from './claudeStreamLine';
import { stepEventKinds, stepStates, type StepEvent, type StepView } from './stepEvents';

/** The steps of one shell run as they happen, fed by the channel the app's shell reports on. */
export class StepFeed {
	steps = $state<StepView[]>([]);

	clear(): void {
		this.steps = [];
	}

	channel(): Channel<StepEvent> {
		const onEvent = new Channel<StepEvent>();
		onEvent.onmessage = (event) => this.hear(event);
		return onEvent;
	}

	lastLinesOf(title: string, count: number): string[] {
		const step = this.steps.find((candidate) => candidate.title === title);
		if (step === undefined) return [];
		return step.lines.slice(-count);
	}

	private hear(event: StepEvent): void {
		if (event.kind === stepEventKinds.stepStarted) this.startStep(event.title);
		if (event.kind === stepEventKinds.outputLine) this.addOutput(event.text);
		if (event.kind === stepEventKinds.stepFinished) this.finishStep(event.isPassed, event.seconds);
	}

	private startStep(title: string): void {
		this.steps.push({ title, state: stepStates.running, seconds: 0, lines: [] });
	}

	private addOutput(text: string): void {
		const step = this.currentStep();
		if (step === undefined) return;
		step.lines.push(...describeOutputLine(text));
	}

	private finishStep(isPassed: boolean, seconds: number): void {
		const step = this.currentStep();
		if (step === undefined) return;
		step.state = isPassed ? stepStates.passed : stepStates.failed;
		step.seconds = seconds;
	}

	private currentStep(): StepView | undefined {
		return this.steps.at(-1);
	}
}
