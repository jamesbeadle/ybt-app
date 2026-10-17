export const statusPhases = {
	checking: 'checking',
	good: 'good',
	bad: 'bad'
} as const;

export type StatusPhase = (typeof statusPhases)[keyof typeof statusPhases];

export const statusDotClasses: Record<StatusPhase, string> = {
	checking: 'bg-etch animate-breathe',
	good: 'bg-go',
	bad: 'bg-caution'
};

export const statusTextClasses: Record<StatusPhase, string> = {
	checking: 'text-etch',
	good: 'text-chalk',
	bad: 'text-caution'
};

export function phaseOf(hasAnswered: boolean, isGood: boolean): StatusPhase {
	if (!hasAnswered) return statusPhases.checking;
	if (isGood) return statusPhases.good;
	return statusPhases.bad;
}
