import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { desktopAgentName } from '$lib/chat/systemPrompt';
import { renewClaim } from './builderActions';
import { keepClaim } from './claimHeartbeat';

vi.mock('./builderActions', () => ({ renewClaim: vi.fn() }));

const renewal = vi.mocked(renewClaim);
const taskId = '01acc8f8-230b-4940-a560-e26ef9cb22dc';
const model = 'qwen3.6-35b-a3b';
const hour = 60 * 60_000;

beforeEach(() => {
	vi.useFakeTimers();
	renewal.mockReset();
	renewal.mockResolvedValue('Recorded');
});

afterEach(() => vi.useRealTimers());

describe('keepClaim', () => {
	it('renews the claim once an hour while the build runs', async () => {
		const stop = keepClaim(taskId, model);
		vi.advanceTimersByTime(hour - 1);
		expect(renewal).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(renewal).toHaveBeenCalledWith(taskId, desktopAgentName, model);
		vi.advanceTimersByTime(hour);
		expect(renewal).toHaveBeenCalledTimes(2);
		await stop();
	});

	it('renews no more once stopped', async () => {
		const stop = keepClaim(taskId, model);
		await stop();
		vi.advanceTimersByTime(3 * hour);
		expect(renewal).not.toHaveBeenCalled();
	});

	it('waits for a renewal still on its way before the stop resolves', async () => {
		let finishRenewal: (answer: string) => void = () => undefined;
		renewal.mockReturnValue(new Promise((resolve) => (finishRenewal = resolve)));
		const stop = keepClaim(taskId, model);
		vi.advanceTimersByTime(hour);
		let hasStopped = false;
		const stopping = stop().then(() => (hasStopped = true));
		await vi.advanceTimersByTimeAsync(0);
		expect(hasStopped).toBe(false);
		finishRenewal('Recorded');
		await stopping;
		expect(hasStopped).toBe(true);
	});

	it('lets a failed renewal pass without failing the stop', async () => {
		renewal.mockRejectedValue(new Error('YBT is unreachable'));
		const stop = keepClaim(taskId, model);
		vi.advanceTimersByTime(hour);
		await expect(stop()).resolves.toBeUndefined();
	});
});
