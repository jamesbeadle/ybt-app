type ToolContent = { type: string; text?: string };
type ToolResult = { content?: ToolContent[]; isError?: boolean };

export type ConnectorAnswer = {
	result?: unknown;
	error?: { message: string };
};

export function readToolText(answer: ConnectorAnswer): string {
	const { error } = answer;
	if (error !== undefined) throw new Error(error.message);
	const result = answer.result as ToolResult | undefined;
	const content = result?.content ?? [];
	const text = content.map((part) => part.text ?? '').join('\n');
	if (result?.isError === true) throw new Error(text);
	return text;
}
