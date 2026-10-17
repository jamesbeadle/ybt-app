export type DesktopSettings = {
	ybtOrigin: string;
	lmStudioOrigin: string;
};

export const defaultSettings: DesktopSettings = {
	ybtOrigin: 'https://yourbusiness.today',
	lmStudioOrigin: 'http://127.0.0.1:1234'
};

export const settingsLabels: Record<keyof DesktopSettings, string> = {
	ybtOrigin: 'YBT address',
	lmStudioOrigin: 'LM Studio address'
};
