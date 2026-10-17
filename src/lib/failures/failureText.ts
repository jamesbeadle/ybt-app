/** The desktop's HTTP layer rejects with plain strings as well as Errors; either way the person sees words, not "undefined". */
export function failureText(failure: unknown): string {
	if (failure instanceof Error) return failure.message;
	return String(failure);
}
