type ToolContent = { type: string; text?: string };
type ToolCallAnswer = {
	result?: { content?: ToolContent[]; isError?: boolean };
	error?: { message: string };
};

export function readToolText(answer: ToolCallAnswer): string {
	const { result, error } = answer;
	if (error !== undefined) throw new Error(error.message);
	const content = result?.content ?? [];
	const text = content.map((part) => part.text ?? '').join('\n');
	if (result?.isError === true) throw new Error(text);
	return text;
}
