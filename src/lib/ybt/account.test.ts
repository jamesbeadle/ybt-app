import { describe, expect, it } from 'vitest';
import { parseAccount } from './account';

describe('parseAccount', () => {
	it('reads the email, standing and projects from the labelled lines', () => {
		const account = parseAccount('Email: james@example.com\nStanding: administrator\nProjects: 3 owned, 1 as a team member');
		expect(account).toEqual({
			email: 'james@example.com',
			standing: 'administrator',
			projects: '3 owned, 1 as a team member'
		});
	});

	it('keeps an unlabelled answer as the email line', () => {
		expect(parseAccount('Signed in as nobody')).toEqual({ email: 'Signed in as nobody', standing: '', projects: '' });
	});
});
