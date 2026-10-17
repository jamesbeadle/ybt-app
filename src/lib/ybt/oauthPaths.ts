export const oauthPaths = {
	register: '/oauth/register',
	authorize: '/oauth/authorize',
	token: '/oauth/token',
	connector: '/api/mcp'
} as const;

export const oauthScope = 'ybt';
export const clientName = 'YBT Desktop';
export const redirectPath = '/callback';
