import { describe, expect, it } from 'vitest';
import { parseClaimedTask } from './claimedTask';

const taskId = '01acc8f8-230b-4940-a560-e26ef9cb22dc';
const projectId = '121925ec-bf29-46a2-bd62-374f3ca05648';
const answer = [
	'Claimed for YBT desktop app on the Mac mini. Build this task:',
	`FIX: the invoice total is rounded up — Work task, In progress, 2 points, 0% done (id: ${taskId})`,
	`Project: YourBusinessToday (id: ${projectId})`,
	'Code: https://github.com/Your-Business-Today/YourBusinessToday (deploys from main).',
	'Priority 3 among the project’s top level tasks.',
	'Details: Round once, at the line total.'
].join('\n');

describe('parseClaimedTask', () => {
	it('reads the task, its project and its repository out of the claim', () => {
		const task = parseClaimedTask(answer);
		expect(task).toMatchObject({
			taskId,
			title: 'FIX: the invoice total is rounded up',
			storyPoints: 2,
			projectName: 'YourBusinessToday',
			repositoryUrl: 'https://github.com/Your-Business-Today/YourBusinessToday',
			defaultBranch: 'main'
		});
	});

	it('keeps the description without the claim line as the text the builder is given', () => {
		const task = parseClaimedTask(answer);
		expect(task?.text.startsWith('FIX: the invoice total')).toBe(true);
		expect(task?.text).toContain('Details: Round once, at the line total.');
	});

	it('leaves the repository empty when the project has none recorded', () => {
		const withoutCode = answer.replace(/^Code: .*$/m, 'No repository recorded.');
		expect(parseClaimedTask(withoutCode)).toMatchObject({ repositoryUrl: '', defaultBranch: '' });
	});

	it('is null when nothing is waiting for the model', () => {
		expect(parseClaimedTask('Nothing is waiting for that model: no open task you can reach is buildable.')).toBeNull();
	});

	it('refuses an answer in another shape', () => {
		expect(() => parseClaimedTask('Sign in first.\nMore.')).toThrow('YBT answered in a shape the builder cannot read: Sign in first.');
	});
});
