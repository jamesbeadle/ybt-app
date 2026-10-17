import { chatRoles, type ChatMessage, type ToolCall } from './chatMessages';

export type TurnHelpers = {
	complete: (messages: ChatMessage[]) => Promise<ChatMessage>;
	callTool: (name: string, toolArguments: Record<string, unknown>) => Promise<string>;
};

export const turnLimits = { toolRounds: 12 } as const;

export async function takeTurn(history: ChatMessage[], helpers: TurnHelpers): Promise<ChatMessage[]> {
	const messages = [...history];
	for (let round = 0; round < turnLimits.toolRounds; round++) {
		const reply = await helpers.complete(messages);
		messages.push(reply);
		const toolCalls = reply.role === chatRoles.assistant ? (reply.tool_calls ?? []) : [];
		if (toolCalls.length === 0) return messages;
		for (const toolCall of toolCalls) messages.push(await answerToolCall(toolCall, helpers));
	}
	messages.push({ role: 'assistant', content: `I stopped after ${turnLimits.toolRounds} rounds of tool calls.` });
	return messages;
}

async function answerToolCall(toolCall: ToolCall, helpers: TurnHelpers): Promise<ChatMessage> {
	const { id, function: called } = toolCall;
	const content = await runToolCall(called.name, called.arguments, helpers).catch(
		(failure: Error) => `The tool failed: ${failure.message}`
	);
	return { role: 'tool', tool_call_id: id, content };
}

async function runToolCall(name: string, argumentText: string, helpers: TurnHelpers): Promise<string> {
	const toolArguments = parseArguments(argumentText);
	if (toolArguments === null) return 'The arguments were not valid JSON. Send them again as a JSON object.';
	return helpers.callTool(name, toolArguments);
}

function parseArguments(argumentText: string): Record<string, unknown> | null {
	try {
		const parsed: unknown = JSON.parse(argumentText === '' ? '{}' : argumentText);
		return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
	} catch {
		return null;
	}
}
