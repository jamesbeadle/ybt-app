import { describe, expect, it } from 'vitest';
import { readRedirect } from './redirectResult';

describe('readRedirect', () => {
	it('reads the code when the state matches', () => {
		expect(readRedirect('/callback?code=abc&state=s1', 's1')).toEqual({ code: 'abc' });
	});

	it('refuses an answer whose state does not match', () => {
		expect(readRedirect('/callback?code=abc&state=other', 's1')).toEqual({
			problem: 'The sign-in answer did not match the request. Try again.'
		});
	});

	it('passes on a refusal from YBT', () => {
		expect(readRedirect('/callback?error=access_denied&state=s1', 's1')).toEqual({
			problem: 'YBT did not sign you in (access_denied).'
		});
	});
});
