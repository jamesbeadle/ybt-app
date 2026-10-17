import { describe, expect, it } from 'vitest';
import { defaultSettings } from './desktopSettings';
import { validateSettings } from './validateSettings';

describe('validateSettings', () => {
	it('accepts the defaults', () => {
		expect(validateSettings(defaultSettings)).toEqual([]);
	});

	it('refuses an address that is not a web address, naming the field', () => {
		const problems = validateSettings({ ...defaultSettings, lmStudioOrigin: 'ftp://mac-mini' });
		expect(problems).toEqual(['LM Studio address must be a web address starting http:// or https://.']);
	});

	it('refuses an address with a path after it', () => {
		const problems = validateSettings({ ...defaultSettings, ybtOrigin: 'https://yourbusiness.today/api' });
		expect(problems).toEqual(['YBT address must be the address alone, with no path after it.']);
	});

	it('refuses an address longer than the limit', () => {
		const longAddress = `https://${'a'.repeat(200)}.today`;
		expect(validateSettings({ ...defaultSettings, ybtOrigin: longAddress })).toHaveLength(1);
	});
});
