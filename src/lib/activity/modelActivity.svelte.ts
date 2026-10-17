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

	loadedModelCount: number = $derived(this.models.filter((model) => model.isLoaded).length);
	hasSteps: boolean = $derived(this.steps.length > 0);

	constructor(private lmStudioOrigin: string) {}

	async refresh(): Promise<void> {
		await Promise.all([this.readModels(), this.readSteps()]);
		this.refreshedAt = new Date().toLocaleTimeString();
	}

	/** Refreshes now and every few seconds after; the returned function stops it. */
	follow(): () => void {
		void this.refresh();
		const timer = setInterval(() => void this.refresh(), refreshSeconds * millisecondsInSecond);
		return () => clearInterval(timer);
	}

	private async readModels(): Promise<void> {
		this.modelProblem = '';
		const served = await listServedModels(desktopFetch, this.lmStudioOrigin).catch((failure: unknown) => {
			this.modelProblem = `LM Studio is not answering at ${this.lmStudioOrigin}: ${failureText(failure)}`;
			return [];
		});
		this.models = loadedFirst(served);
	}

	private async readSteps(): Promise<void> {
		this.stepProblem = '';
		this.steps = await readRecentSteps().catch((failure: unknown) => {
			this.stepProblem = `YBT did not answer: ${failureText(failure)}`;
			return [];
		});
	}
}
