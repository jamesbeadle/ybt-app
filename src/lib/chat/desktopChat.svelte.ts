import { fetch as desktopFetch } from '@tauri-apps/plugin-http';
import { requestCompletion } from '$lib/lmStudio/chatCompletion';
import { callTool, listTools } from '$lib/ybt/ybtConnector';
import type { ChatMessage, FunctionTool } from './chatMessages';
import { asFunctionTools } from './connectorTools';
import { startConversation } from './startConversation';
import { takeTurn } from './conversationTurn';

export class DesktopChat {
	messages = $state<ChatMessage[]>([]);
	isThinking = $state(false);
	problem = $state('');
	#tools: FunctionTool[] = [];

	constructor(private readonly lmStudioOrigin: string) {}

	async send(text: string, modelId: string): Promise<void> {
		this.problem = '';
		this.isThinking = true;
		await this.#answer(text, modelId).catch((failure: Error) => (this.problem = failure.message));
		this.isThinking = false;
	}

	startAgain(): void {
		this.messages = [];
		this.problem = '';
	}

	async #answer(text: string, modelId: string): Promise<void> {
		if (this.messages.length === 0) await this.#open(modelId);
		const history: ChatMessage[] = [...this.messages, { role: 'user', content: text }];
		this.messages = history;
		this.messages = await takeTurn(history, {
			complete: (messages) =>
				requestCompletion(desktopFetch, this.lmStudioOrigin, { model: modelId, messages, tools: this.#tools }),
			callTool
		});
	}

	async #open(modelId: string): Promise<void> {
		this.#tools = asFunctionTools(await listTools());
		this.messages = await startConversation(modelId);
	}
}
