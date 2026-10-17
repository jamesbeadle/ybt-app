import { describe, expect, it } from 'vitest';
import { readToolText } from './toolAnswer';

describe('readToolText', () => {
	it('joins the text parts of a tool result', () => {
		const answer = { result: { content: [{ type: 'text', text: 'one' }, { type: 'text', text: 'two' }] } };
		expect(readToolText(answer)).toBe('one\ntwo');
	});

	it('throws the message of a failed call', () => {
		expect(() => readToolText({ error: { message: 'No such tool' } })).toThrow('No such tool');
		expect(() => readToolText({ result: { content: [{ type: 'text', text: 'Refused' }], isError: true } })).toThrow('Refused');
	});
});
