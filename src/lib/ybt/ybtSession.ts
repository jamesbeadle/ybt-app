export type YbtSession = {
	ybtOrigin: string;
	clientId: string;
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
};

const refreshMarginMilliseconds = 60_000;

export function needsRefresh(session: YbtSession, now: number): boolean {
	return session.expiresAt - refreshMarginMilliseconds <= now;
}
