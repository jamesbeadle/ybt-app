export type HarnessRequest = {
	checkout: string;
	taskText: string;
	model: string;
	lmStudioOrigin: string;
};

export const harnessLimits = { longestTaskText: 8000 } as const;
