import { describe, expect, it } from 'vitest';
import { confirmedHandOver, confirmedHandUp, confirmedRelease } from './ybtAnswers';

const branch = 'fix/invoice-total-rounded';
const title = 'FIX: the invoice total is rounded up';

describe('confirmedHandOver', () => {
	it('passes the answer through once YBT has taken the branch for review', () => {
		const answer = `"${title}" is built on ${branch}. Review task raised for claude-opus (id: 7a3b1c2d-0000-4000-8000-000000000000).`;
		expect(confirmedHandOver(answer, branch)).toBe(answer);
	});

	it('raises a refusal naming the branch', () => {
		const refusal = 'No review model is set. An administrator chooses one on the admin page.';
		expect(() => confirmedHandOver(refusal, branch)).toThrow(`YBT did not take ${branch} for review: ${refusal}`);
	});
});

describe('confirmedRelease', () => {
	it('passes the answer through once YBT has recorded the release', () => {
		const answer = `Recorded on "${title}": released by YBT desktop app on the Mac mini.`;
		expect(confirmedRelease(answer)).toBe(answer);
	});

	it('raises a refusal', () => {
		expect(() => confirmedRelease('Name the task.')).toThrow('YBT did not record the task as released: Name the task.');
	});
});

describe('confirmedHandUp', () => {
	it('passes the answer through once the next tier may build the task', () => {
		const answer = `"${title}": Buildable by Standard cloud model (named on the task).`;
		expect(confirmedHandUp(answer, 'claude-opus')).toBe(answer);
	});

	it('raises a refusal naming the tier', () => {
		const refusal = `"${title}": Not tagged buildable, so no model takes it unattended.`;
		expect(() => confirmedHandUp(refusal, 'claude-opus')).toThrow(`YBT did not hand the task up to claude-opus: ${refusal}`);
	});
});
