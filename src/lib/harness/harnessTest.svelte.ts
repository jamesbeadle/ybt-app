import { invoke } from '@tauri-apps/api/core';
import { failureText } from '$lib/failures/failureText';
import { StepFeed } from '$lib/steps/stepFeed.svelte';
import type { HarnessRequest } from './harnessRequest';

const runCommand = 'run_harness_test';

/** One run of the local harness test, followed step by step as the app's shell reports it. */
export class HarnessTest {
	feed = new StepFeed();
	isRunning = $state(false);
	problem = $state('');

	async run(request: HarnessRequest): Promise<void> {
		this.feed.clear();
		this.problem = '';
		this.isRunning = true;
		await invoke(runCommand, { request, onEvent: this.feed.channel() }).catch(
			(failure) => (this.problem = failureText(failure))
		);
		this.isRunning = false;
	}
}
