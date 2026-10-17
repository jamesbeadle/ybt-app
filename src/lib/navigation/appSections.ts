export type AppSection = { href: string; label: string };

export const appSections: AppSection[] = [
	{ href: '/', label: 'Connections' },
	{ href: '/chat', label: 'Chat' },
	{ href: '/board', label: 'Board' },
	{ href: '/activity', label: 'Activity' },
	{ href: '/test', label: 'Local test' },
	{ href: '/settings', label: 'Settings' }
];

export function isSectionCurrent(section: AppSection, pathname: string): boolean {
	return section.href === pathname;
}
