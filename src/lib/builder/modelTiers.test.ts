import { describe, expect, it } from 'vitest';
import { chosenTier, escalationTier, localTierModel, tierAbove } from './modelTiers';
import type { BuildModel } from '$lib/board/buildQueue';

const models: BuildModel[] = [
	{ modelId: 'claude-fable', label: 'Advanced cloud model', leastPoints: 13, mostPoints: 21 },
	{ modelId: 'qwen-local', label: 'Local model', leastPoints: 1, mostPoints: 2 },
	{ modelId: 'claude-opus', label: 'Standard cloud model', leastPoints: 3, mostPoints: 8 }
];

describe('model tiers', () => {
	it('finds the local tier as the one with the smallest tasks', () => {
		expect(localTierModel(models)?.modelId).toBe('qwen-local');
		expect(localTierModel([])).toBeNull();
	});

	it('finds the tier above a model, and none above the top', () => {
		expect(tierAbove(models, 'qwen-local')?.modelId).toBe('claude-opus');
		expect(tierAbove(models, 'claude-opus')?.modelId).toBe('claude-fable');
		expect(tierAbove(models, 'claude-fable')).toBeNull();
		expect(tierAbove(models, 'unknown')).toBeNull();
	});

	it('keeps a chosen tier while YBT lists it and falls back to the local tier', () => {
		expect(chosenTier(models, 'claude-opus')).toBe('claude-opus');
		expect(chosenTier(models, 'gone')).toBe('qwen-local');
		expect(chosenTier([], 'gone')).toBe('');
	});

	it('hands a failed build to the tier above, or to the review model from the top tier', () => {
		expect(escalationTier(models, 'qwen-local', 'claude-opus')?.modelId).toBe('claude-opus');
		expect(escalationTier(models, 'claude-fable', 'claude-opus')?.modelId).toBe('claude-opus');
		expect(escalationTier(models, 'claude-fable', 'claude-fable')).toBeNull();
		expect(escalationTier(models, 'claude-fable', 'gone')).toBeNull();
	});
});
