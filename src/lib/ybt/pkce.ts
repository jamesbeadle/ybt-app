export type PkcePair = { verifier: string; challenge: string };

const verifierByteCount = 32;
const stateByteCount = 16;

export async function createPkcePair(): Promise<PkcePair> {
	const verifier = randomText(verifierByteCount);
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
	return { verifier, challenge: base64Url(new Uint8Array(digest)) };
}

export function createState(): string {
	return randomText(stateByteCount);
}

function randomText(byteCount: number): string {
	return base64Url(crypto.getRandomValues(new Uint8Array(byteCount)));
}

export function base64Url(bytes: Uint8Array): string {
	const binary = String.fromCharCode(...bytes);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
