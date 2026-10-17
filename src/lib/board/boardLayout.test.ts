import { describe, expect, it } from 'vitest';
import { boardLayout } from './boardLayout';
import type { BuildModel, BuildQueueEntry } from './buildQueue';

const models: BuildModel[] = [
	{ modelId: 'qwen-local', label: 'Qwen', leastPoints: 1, mostPoints: 2 },
	{ modelId: 'claude-opus', label: 'Claude Opus', leastPoints: 3, mostPoints: 8 }
];

function task(title: string, storyPoints: number): BuildQueueEntry {
	return { title, storyPoints, namedModelId: null } as BuildQueueEntry;
}

describe('boardLayout', () => {
	it('puts each task under the model that takes it, keeping queue order', () => {
		const { columns } = boardLayout([task('a', 2), task('b', 5), task('c', 1)], models);
		expect(columns.map((column) => column.tasks.map((entry) => entry.title))).toEqual([['a', 'c'], ['b']]);
	});

	it('keeps the tasks no model takes apart from the columns', () => {
		const { columns, unplaced } = boardLayout([task('big', 21)], models);
		expect(columns.map((column) => column.tasks)).toEqual([[], []]);
		expect(unplaced).toMatchObject([{ title: 'big' }]);
	});
});
