import type { Fetcher } from './oauthClient';

type ServerMetadata = { issuer?: string };

const metadataPath = '/.well-known/oauth-authorization-server';

/** The address YBT answers at once any redirect is followed, so a bearer token is never sent to a host that drops it. */
export async function discoverYbtOrigin(fetcher: Fetcher, configuredOrigin: string): Promise<string> {
	const response = await fetcher(`${configuredOrigin}${metadataPath}`);
	if (!response.ok) throw new Error(`YBT did not describe its sign-in (${response.status}).`);
	const metadata: ServerMetadata = await response.json();
	return metadata.issuer ?? configuredOrigin;
}
