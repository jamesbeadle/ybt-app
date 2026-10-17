import { failureText } from '$lib/failures/failureText';
import { fetch as desktopFetch } from '@tauri-apps/plugin-http';
import { listServedModels, loadedFirst, type ServedModel } from '$lib/lmStudio/servedModels';
import { readRecentSteps } from './readRecentSteps';
import type { RecentStep } from './recentSteps';

export const refreshSeconds = 15;
const millisecondsInSecond = 1000;

export class ModelActivity {
	models = $state<ServedModel[]>([]);
	steps = $state<RecentStep[]>([]);
	modelProblem = $state('');
	stepProblem = $state('');
	refreshedAt = $state('');
	hasRefreshed = $state(false);

	loadedModelCount: number = $derived(this.models.filter((model) => model.isLoaded).length);
	hasSteps: boolean = $derived(this.steps.length > 0);

	constructor(private lmStudioOrigin: string) {}

	async refresh(): Promise<void> {
		await Promise.all([this.readModels(), this.readSteps()]);
		this.refreshedAt = new Date().toLocaleTimeString();
		this.hasRefreshed = true;
	}

	/** Refreshes now and every few seconds after; the returned function stops it. */
	follow(): () => void {
		void this.refresh();
		const timer = setInterval(() => void this.refresh(), refreshSeconds * millisecondsInSecond);
		return () => clearInterval(timer);
	}

	private async readModels(): Promise<void> {
		const served = await listServedModels(desktopFetch, this.lmStudioOrigin).catch(
			(failure: unknown) => new Error(failureText(failure))
		);
		if (served instanceof Error) {
			this.modelProblem = `LM Studio is not answering at ${this.lmStudioOrigin}: ${served.message}`;
			return;
		}
		this.modelProblem = '';
		this.models = loadedFirst(served);
	}

	private async readSteps(): Promise<void> {
		const steps = await readRecentSteps().catch((failure: unknown) => new Error(failureText(failure)));
		if (steps instanceof Error) {
			this.stepProblem = `YBT did not answer: ${steps.message}`;
			return;
		}
		this.stepProblem = '';
		this.steps = steps;
	}
}
