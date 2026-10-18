import { describe, expect, it } from 'vitest';
import { taskBranchName } from './taskBranchName';

const ybtBranchPattern = /^(?!\/)(?!.*\/\/)(?!.*\.\.)[A-Za-z0-9._/-]+(?<![/.])$/;

describe('taskBranchName', () => {
	it('names a fix branch after what is wrong, without the noise words', () => {
		expect(taskBranchName('FIX: the invoice total is rounded up')).toBe('fix/invoice-total-rounded');
	});

	it('names a feature branch after the story', () => {
		expect(taskBranchName('A quantity surveyor sees the weekly cashflow grid')).toBe(
			'feature/quantity-surveyor-weekly-cashflow-grid'
		);
	});

	it('drops apostrophes and punctuation', () => {
		expect(taskBranchName("The YBT desktop app builds the local model's tasks on a branch")).toBe(
			'feature/ybt-desktop-app-builds-local-models-tasks-branch'
		);
	});

	it('keeps whole words while the slug fits sixty characters', () => {
		const slug = taskBranchName('Alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima mike');
		expect(slug).toBe('feature/alpha-bravo-charlie-delta-echo-foxtrot-golf-hotel-india');
		expect(slug.length).toBeLessThanOrEqual('feature/'.length + 60);
	});

	it('falls back to the plain words, then to "task", when nothing meaningful is left', () => {
		expect(taskBranchName('The and of')).toBe('feature/the-and-of');
		expect(taskBranchName('FIX: ???')).toBe('fix/task');
	});

	it('always makes a name YBT accepts', () => {
		const titles = ['FIX: ..leading dots..', 'Trailing slash /', 'Émigré café — ünïcode', '   '];
		for (const title of titles) expect(taskBranchName(title)).toMatch(ybtBranchPattern);
	});
});
