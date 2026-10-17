import { describe, expect, it } from 'vitest';
import { parseRecentSteps, stepSentence, type RecentStep } from './recentSteps';

const step: RecentStep = {
	id: 'step-1',
	taskId: 'task-1',
	goalId: null,
	step: 'considered',
	outcome: 'buildable',
	agent: 'mac-mini',
	model: 'qwen3.6-35b-a3b',
	note: '',
	taskTitle: 'Fix the date picker',
	goalTitle: '',
	createdAt: '2026-10-17T10:00:00Z'
};

describe('stepSentence', () => {
	it('names who decided what about which task', () => {
		expect(stepSentence(step)).toBe('mac-mini (qwen3.6-35b-a3b) considered “Fix the date picker”: buildable.');
	});

	it('leaves out an empty outcome and model, and names a goal', () => {
		const goalStep = { ...step, model: '', outcome: 'none', step: 'considering', taskTitle: '', goalTitle: 'Launch' };
		expect(stepSentence(goalStep)).toBe('mac-mini considering “the goal Launch”.');
	});
});

describe('parseRecentSteps', () => {
	it('reads the steps from the connector answer', () => {
		expect(parseRecentSteps(JSON.stringify({ steps: [step] }))).toEqual([step]);
		expect(parseRecentSteps('{}')).toEqual([]);
	});
});
