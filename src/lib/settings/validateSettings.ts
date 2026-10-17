import { settingsLabels, type DesktopSettings } from './desktopSettings';

export const addressLimits = { longest: 200 } as const;

const webProtocols = ['http:', 'https:'];
const rootPath = '/';

export function validateSettings(settings: DesktopSettings): string[] {
	const fields = Object.keys(settingsLabels) as (keyof DesktopSettings)[];
	return fields.flatMap((field) => addressProblems(settingsLabels[field], settings[field]));
}

function addressProblems(label: string, address: string): string[] {
	if (address.length > addressLimits.longest) {
		return [`${label} must be at most ${addressLimits.longest} characters.`];
	}
	const parsed = URL.canParse(address) ? new URL(address) : null;
	if (parsed === null || !webProtocols.includes(parsed.protocol)) {
		return [`${label} must be a web address starting http:// or https://.`];
	}
	if (!isBareAddress(parsed)) {
		return [`${label} must be the address alone, with no path after it.`];
	}
	return [];
}

function isBareAddress(address: URL): boolean {
	return `${address.origin}${rootPath}` === address.href;
}

export function originOf(address: string): string {
	return new URL(address).origin;
}
