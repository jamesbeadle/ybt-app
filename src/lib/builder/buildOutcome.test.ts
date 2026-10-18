import { describe, expect, it } from 'vitest';
import { branchCompareUrl, buildOutcomes, buildRecord, failureNote, handOverNote, type BuildReport } from './buildOutcome';
import type { ClaimedTask } from './claimedTask';

const task: ClaimedTask = {
	taskId: '01acc8f8-230b-4940-a560-e26ef9cb22dc',
	title: 'FIX: the invoice total is rounded up',
	storyPoints: 2,
	projectName: 'YourBusinessToday',
	repositoryUrl: 'https://github.com/Your-Business-Today/YourBusinessToday.git',
	defaultBranch: 'main',
	text: 'FIX: the invoice total is rounded up — Work task'
};
const pushed: BuildReport = {
	checkout: '/Users/james/ybt-builds/YourBusinessToday',
	failedStep: null,
	failedStage: null,
	commitCount: 2,
	diffStat: ' 1 file changed',
	isPushed: true
};

describe('branchCompareUrl', () => {
	it('points at the GitHub comparison for a GitHub repository, with or without .git', () => {
		const expected = 'https://github.com/Your-Business-Today/YourBusinessToday/compare/main...fix/invoice-total-rounded';
		expect(branchCompareUrl(task.repositoryUrl, 'main', 'fix/invoice-total-rounded')).toBe(expected);
		expect(branchCompareUrl('https://github.com/Your-Business-Today/YourBusinessToday', 'main', 'fix/invoice-total-rounded')).toBe(expected);
		expect(branchCompareUrl('git@github.com:Your-Business-Today/YourBusinessToday.git', 'main', 'fix/invoice-total-rounded')).toBe(expected);
	});

	it('is empty for a repository that is not on GitHub', () => {
		expect(branchCompareUrl('https://dev.azure.com/jewel/portal', 'main', 'fix/x')).toBe('');
	});
});

describe('failureNote', () => {
	it('says which step failed, what the branch keeps and the last output', () => {
		const report: BuildReport = { ...pushed, failedStep: "Run the repository's checks", isPushed: false };
		const note = failureNote(report, 'fix/invoice-total-rounded', ['npm test', '1 failed']);
		expect(note).toBe(
			"Run the repository's checks failed in the YBT desktop app's local build. " +
				'The branch fix/invoice-total-rounded in /Users/james/ybt-builds/YourBusinessToday keeps 2 commits, not pushed. ' +
				'Last output:\nnpm test\n1 failed'
		);
	});

	it('says the next attempt starts afresh when nothing was committed', () => {
		const report: BuildReport = { ...pushed, failedStep: 'Claude Code builds the task', commitCount: 0, isPushed: false };
		expect(failureNote(report, 'fix/x', [])).toContain('Nothing was committed, so the next attempt starts afresh.');
	});

	it('keeps the tail of long output so the note fits what YBT accepts', () => {
		const report: BuildReport = { ...pushed, failedStep: 'Push the branch' };
		const note = failureNote(report, 'fix/x', Array.from({ length: 400 }, (_, index) => `line ${index}`));
		expect(note.length).toBeLessThanOrEqual(2000);
		expect(note.endsWith('line 399')).toBe(true);
	});
});

describe('buildRecord', () => {
	it('links the comparison only once the branch is pushed', () => {
		const handedOver = buildRecord(task, 'fix/invoice-total-rounded', pushed, buildOutcomes.handedToReview, handOverNote(pushed), 'ok');
		expect(handedOver.compareUrl).toContain('/compare/main...fix/invoice-total-rounded');
		expect(handedOver.note).toBe('Built by the YBT desktop app on the local model: 2 commits, checked and pushed.');
		const unpushed = buildRecord(task, 'fix/x', { ...pushed, isPushed: false }, buildOutcomes.released, 'note', 'ok');
		expect(unpushed.compareUrl).toBe('');
		expect(unpushed.finishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
	});
});
