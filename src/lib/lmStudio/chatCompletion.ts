import type { ChatMessage, FunctionTool } from '$lib/chat/chatMessages';
import type { Fetcher } from './lmStudio';

export type CompletionRequest = { model: string; messages: ChatMessage[]; tools: FunctionTool[] };

type CompletionAnswer = { choices?: { message: ChatMessage }[] };

const completionsPath = '/v1/chat/completions';

export async function requestCompletion(
	fetcher: Fetcher,
	lmStudioOrigin: string,
	request: CompletionRequest
): Promise<ChatMessage> {
	const response = await fetcher(`${lmStudioOrigin}${completionsPath}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(request)
	});
	if (!response.ok) throw new Error(`LM Studio answered ${response.status}.`);
	const answer: CompletionAnswer = await response.json();
	const [firstChoice] = answer.choices ?? [];
	if (firstChoice === undefined) throw new Error('LM Studio sent no answer.');
	return firstChoice.message;
}
