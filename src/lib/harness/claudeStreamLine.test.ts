import { describe, expect, it } from 'vitest';
import { describeOutputLine } from './claudeStreamLine';

describe('describeOutputLine', () => {
	it('passes a plain line through', () => {
		expect(describeOutputLine('npm test passed')).toEqual(['npm test passed']);
	});

	it('names the model Claude Code started on', () => {
		const line = JSON.stringify({ type: 'system', subtype: 'init', model: 'qwen3.6-35b-a3b-mlx' });
		expect(describeOutputLine(line)).toEqual(['Claude Code started on qwen3.6-35b-a3b-mlx.']);
	});

	it('says what the model wrote and which tool it used', () => {
		const content = [{ type: 'text', text: 'Reading the file.' }, { type: 'tool_use', name: 'Read', input: { file_path: 'a.ts' } }];
		const line = JSON.stringify({ type: 'assistant', message: { content } });
		expect(describeOutputLine(line)).toEqual(['Model: Reading the file.', 'Uses Read: {"file_path":"a.ts"}']);
	});

	it('sums up the result', () => {
		const line = JSON.stringify({ type: 'result', subtype: 'success', num_turns: 4, duration_ms: 61000, result: 'Done.' });
		expect(describeOutputLine(line)).toEqual(['Finished (success) after 4 turns in 61s: Done.']);
	});

	it('keeps a broken JSON line as it came', () => {
		expect(describeOutputLine('{not json')).toEqual(['{not json']);
	});
});
