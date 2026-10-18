import { describe, expect, it } from 'vitest';
import { buildRequest, stoppedBefore, type BuildSetup } from './buildAttempt';
import type { ClaimedTask } from './claimedTask';

const setup: BuildSetup = {
	lmStudioOrigin: 'http://localhost:1234',
	buildsFolder: '/Users/james/ybt-builds',
	model: 'qwen3.6-35b-a3b',
	tierModelId: 'qwen-local',
	nextTierModelId: 'claude-opus'
};
const task: ClaimedTask = {
	taskId: '01acc8f8-230b-4940-a560-e26ef9cb22dc',
	title: 'FIX: the invoice total is rounded up',
	storyPoints: 2,
	projectName: 'YourBusinessToday',
	repositoryUrl: 'https://github.com/Your-Business-Today/YourBusinessToday',
	defaultBranch: 'main',
	text: 'FIX: the invoice total is rounded up — Work task, Backlog, 2 points, 0% done'
};

describe('buildRequest', () => {
	it('hands the shell the repository, the branch, the task and the model', () => {
		expect(buildRequest(setup, task, 'fix/invoice-total-rounded')).toEqual({
			buildsFolder: '/Users/james/ybt-builds',
			repositoryUrl: 'https://github.com/Your-Business-Today/YourBusinessToday',
			defaultBranch: 'main',
			branch: 'fix/invoice-total-rounded',
			taskTitle: 'FIX: the invoice total is rounded up',
			taskText: task.text,
			model: 'qwen3.6-35b-a3b',
			lmStudioOrigin: 'http://localhost:1234'
		});
	});
});

describe('stoppedBefore', () => {
	it('reports a build that never started as failed at the step named, keeping only the reason', () => {
		expect(stoppedBefore('Finding the repository', 'No repository is recorded.')).toEqual({
			report: { checkout: '', failedStep: 'Finding the repository', commitCount: 0, diffStat: '', isPushed: false },
			lastLines: ['No repository is recorded.']
		});
	});
});
