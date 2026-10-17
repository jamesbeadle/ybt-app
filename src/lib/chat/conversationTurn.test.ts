import { describe, expect, it } from 'vitest';
import { takeTurn, turnLimits, type TurnHelpers } from './conversationTurn';
import type { ChatMessage } from './chatMessages';

const question: ChatMessage = { role: 'user', content: 'What projects do I have?' };

function askingFor(toolArguments: string): ChatMessage {
	return {
		role: 'assistant',
		content: null,
		tool_calls: [{ id: 'call-1', type: 'function', function: { name: 'perform_action', arguments: toolArguments } }]
	};
}

function scripted(replies: ChatMessage[], calls: string[] = []): TurnHelpers {
	return {
		complete: async () => replies.shift() ?? { role: 'assistant', content: 'done' },
		callTool: async (name, toolArguments) => {
			calls.push(`${name} ${JSON.stringify(toolArguments)}`);
			return 'Your projects: YourBusinessToday';
		}
	};
}

describe('takeTurn', () => {
	it('runs the tools the model asks for and returns its final answer', async () => {
		const calls: string[] = [];
		const answer: ChatMessage = { role: 'assistant', content: 'You have one project.' };
		const messages = await takeTurn([question], scripted([askingFor('{"name":"list_projects"}'), answer], calls));
		expect(calls).toEqual(['perform_action {"name":"list_projects"}']);
		expect(messages.map((message) => message.role)).toEqual(['user', 'assistant', 'tool', 'assistant']);
		expect(messages.at(-1)).toEqual(answer);
	});

	it('tells the model when its arguments are not JSON, without calling the tool', async () => {
		const calls: string[] = [];
		const messages = await takeTurn([question], scripted([askingFor('{not json')], calls));
		expect(calls).toEqual([]);
		expect(messages[2]).toMatchObject({ role: 'tool', content: expect.stringContaining('not valid JSON') });
	});

	it('stops a model that never stops calling tools', async () => {
		const helpers: TurnHelpers = { complete: async () => askingFor('{}'), callTool: async () => 'ok' };
		const messages = await takeTurn([question], helpers);
		expect(messages.at(-1)?.content).toContain(`${turnLimits.toolRounds} rounds`);
	});
});
