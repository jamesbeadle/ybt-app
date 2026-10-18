const fixTitleStart = 'FIX:';
const branchKinds = { fix: 'fix/', feature: 'feature/' } as const;
const longestSlug = 60;
const fallbackSlug = 'task';
const apostrophes = /['’]/g;
const wordBreaks = /[^a-z0-9]+/;
const noiseWords = new Set([
	'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'in', 'on', 'at', 'for', 'and', 'or', 'as',
	'it', 'its', 'with', 'by', 'from', 'that', 'this', 'up', 'so', 'i', 'want', 'wants', 'see', 'sees', 'can',
	'them', 'they', 'their', 'we', 'our', 'my', 'me', 'has', 'have', 'do', 'does', 'not', 'when', 'then', 'into',
	'onto', 'through', 'own', 'each', 'every'
]);

/** The branch a task is built on: fix/<slug> for a FIX task, feature/<slug> for a story, the slug cut from the title's words. */
export function taskBranchName(title: string): string {
	const trimmed = title.trim();
	const isFix = trimmed.startsWith(fixTitleStart);
	const subject = isFix ? trimmed.slice(fixTitleStart.length) : trimmed;
	const kind = isFix ? branchKinds.fix : branchKinds.feature;
	return `${kind}${slugOf(subject)}`;
}

function slugOf(subject: string): string {
	const words = subject.toLowerCase().replace(apostrophes, '').split(wordBreaks).filter((word) => word !== '');
	const meaningful = words.filter((word) => !noiseWords.has(word));
	const chosen = meaningful.length === 0 ? words : meaningful;
	if (chosen.length === 0) return fallbackSlug;
	return fitted(chosen);
}

function fitted(words: string[]): string {
	const [first, ...rest] = words;
	let slug = first;
	for (const word of rest) {
		const longer = `${slug}-${word}`;
		if (longer.length > longestSlug) break;
		slug = longer;
	}
	return slug;
}
