import { describe, expect, it } from 'vitest';
import { draftOf, isSameDraft, validateYbtModel } from './saveYbtModel';

const tier = { modelId: 'claude-opus', label: 'Standard cloud model', leastPoints: 3, mostPoints: 8 };

describe('validateYbtModel', () => {
	it('accepts a named tier with a range on the scale', () => {
		expect(validateYbtModel({ ...draftOf(tier), runsOn: 'Claude Opus 5.5' })).toBeNull();
	});

	it('refuses a nameless tier and a range running backwards', () => {
		expect(validateYbtModel({ ...draftOf(tier), label: ' ' })).toBe('The tier needs a name.');
		expect(validateYbtModel({ ...draftOf(tier), leastPoints: 8, mostPoints: 3 })).toBe(
			'The least points must not be more than the most.'
		);
	});
});

describe('draftOf', () => {
	it('reads a tier into an editable draft and spots an unchanged one', () => {
		expect(draftOf(tier)).toEqual({ label: 'Standard cloud model', runsOn: '', leastPoints: 3, mostPoints: 8 });
		expect(isSameDraft(draftOf(tier), draftOf(tier))).toBe(true);
		expect(isSameDraft(draftOf(tier), { ...draftOf(tier), runsOn: 'x' })).toBe(false);
	});
});
