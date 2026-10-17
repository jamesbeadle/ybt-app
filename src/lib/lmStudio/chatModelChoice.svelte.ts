import { fetch as desktopFetch } from '@tauri-apps/plugin-http';
import { failureText } from '$lib/failures/failureText';
import { listLocalModels } from './lmStudio';
import { chatModels, preferredModel } from './preferredModel';

/** The chat models LM Studio serves at one address, and the one chosen from them. */
export class ChatModelChoice {
	models = $state<string[]>([]);
	modelId = $state('');
	isReading = $state(true);
	problem = $state('');

	hasModel: boolean = $derived(this.modelId !== '');
	isNotAnswering: boolean = $derived(!this.isReading && this.problem !== '');
	isServingNone: boolean = $derived(!this.isReading && this.problem === '' && this.models.length === 0);

	constructor(readonly lmStudioOrigin: string) {}

	async read(): Promise<void> {
		this.isReading = true;
		const served = await listLocalModels(desktopFetch, this.lmStudioOrigin).catch(
			(failure: unknown) => new Error(failureText(failure))
		);
		this.remember(served);
		this.isReading = false;
	}

	private remember(served: string[] | Error): void {
		if (served instanceof Error) {
			this.problem = served.message;
			this.models = [];
			this.modelId = '';
			return;
		}
		this.problem = '';
		this.models = chatModels(served);
		this.modelId = preferredModel(served);
	}
}
