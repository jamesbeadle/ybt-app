import { describe, expect, it } from 'vitest';
import { buildRefusal, buildStages } from './buildStage';

describe('buildRefusal', () => {
	it("passes the shell's refusal through as it was sent", () => {
		const refusal = { reason: 'The repository address is not a git address.', stage: buildStages.task };
		expect(buildRefusal(refusal)).toBe(refusal);
	});

	it('makes an Error a fault on this computer, in its own words', () => {
		expect(buildRefusal(new Error('git was not found'))).toEqual({ reason: 'git was not found', stage: buildStages.machine });
	});

	it('makes a plain string a fault on this computer', () => {
		expect(buildRefusal('The builds folder is not writable')).toEqual({
			reason: 'The builds folder is not writable',
			stage: buildStages.machine
		});
	});

	it('makes a refusal at a stage it does not know a fault on this computer', () => {
		const refusal = { reason: 'Something else', stage: 'elsewhere' };
		expect(buildRefusal(refusal).stage).toBe(buildStages.machine);
	});
});
