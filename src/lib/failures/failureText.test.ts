import { describe, expect, it } from 'vitest';
import { failureText } from './failureText';

describe('failureText', () => {
	it('reads an Error and a plain string alike', () => {
		expect(failureText(new Error('refused'))).toBe('refused');
		expect(failureText('error sending request')).toBe('error sending request');
	});
});
