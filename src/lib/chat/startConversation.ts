import { callTool } from '$lib/ybt/ybtConnector';
import type { ChatMessage } from './chatMessages';
import { systemPrompt } from './systemPrompt';

const contextTool = 'get_current_context';

export async function startConversation(modelId: string): Promise<ChatMessage[]> {
	const workingContext = await callTool(contextTool, {});
	return [{ role: 'system', content: systemPrompt(workingContext, modelId) }];
}
