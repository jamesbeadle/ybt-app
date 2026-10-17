import { describe, expect, it } from 'vitest';
import { modelTakingTask, rangesOnThisMachine, validateRange } from './modelRanges';
import type { BuildModel, BuildQueueEntry } from './buildQueue';

const models: BuildModel[] = [
	{ modelId: 'qwen-local', label: 'Qwen', leastPoints: 1, mostPoints: 2 },
	{ modelId: 'claude-opus', label: 'Claude Opus', leastPoints: 3, mostPoints: 8 }
];

const threePointTask = { storyPoints: 3, namedModelId: null } as BuildQueueEntry;

describe('model ranges on this machine', () => {
	it('lets this machine widen what the local model takes', () => {
		const widened = rangesOnThisMachine(models, { 'qwen-local': { leastPoints: 1, mostPoints: 3 } });
		expect(modelTakingTask(threePointTask, widened)?.modelId).toBe('qwen-local');
		expect(modelTakingTask(threePointTask, models)?.modelId).toBe('claude-opus');
	});

	it('keeps a model named on the task whatever the ranges say', () => {
		const named = { storyPoints: 1, namedModelId: 'claude-opus' } as BuildQueueEntry;
		expect(modelTakingTask(named, models)?.modelId).toBe('claude-opus');
	});

	it('refuses ranges off the scale or the wrong way round', () => {
		expect(validateRange({ leastPoints: 4, mostPoints: 8 })).toContain('on the scale');
		expect(validateRange({ leastPoints: 8, mostPoints: 3 })).toContain('not be more');
		expect(validateRange({ leastPoints: 1, mostPoints: 3 })).toBeNull();
	});
});
