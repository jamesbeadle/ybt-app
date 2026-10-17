type ContentPart = { type?: string; text?: string; name?: string; input?: Record<string, unknown>; is_error?: boolean };
type StreamMessage = { content?: ContentPart[] | string };
type StreamLine = {
	type?: string;
	subtype?: string;
	model?: string;
	message?: StreamMessage;
	num_turns?: number;
	duration_ms?: number;
	result?: string;
};

const lineTypes = { system: 'system', assistant: 'assistant', user: 'user', result: 'result' } as const;
const partTypes = { text: 'text', toolUse: 'tool_use', toolResult: 'tool_result' } as const;
const millisecondsPerSecond = 1000;
const inputPreviewLength = 120;

/** Claude Code's stream-json output turned into plain sentences; any other line is shown as it came. */
export function describeOutputLine(line: string): string[] {
	const parsed = parseStreamLine(line);
	if (parsed === null) return [line];
	return describeStreamLine(parsed);
}

function parseStreamLine(line: string): StreamLine | null {
	if (!line.startsWith('{')) return null;
	try {
		return JSON.parse(line) as StreamLine;
	} catch {
		return null;
	}
}

function describeStreamLine(parsed: StreamLine): string[] {
	if (parsed.type === lineTypes.system) return [`Claude Code started on ${parsed.model ?? 'the local model'}.`];
	if (parsed.type === lineTypes.result) return [describeResult(parsed)];
	return partsOf(parsed.message).flatMap(describePart);
}

function partsOf(message: StreamMessage | undefined): ContentPart[] {
	const content = message?.content;
	if (!Array.isArray(content)) return [];
	return content;
}

function describeResult(parsed: StreamLine): string {
	const seconds = Math.round((parsed.duration_ms ?? 0) / millisecondsPerSecond);
	return `Finished (${parsed.subtype ?? 'done'}) after ${parsed.num_turns ?? 0} turns in ${seconds}s: ${parsed.result ?? ''}`;
}

function describePart(part: ContentPart): string[] {
	if (part.type === partTypes.text) return [`Model: ${part.text ?? ''}`];
	if (part.type === partTypes.toolUse) return [`Uses ${part.name ?? 'a tool'}: ${previewInput(part.input)}`];
	if (part.type === partTypes.toolResult) return [part.is_error ? 'The tool reported an error.' : 'The tool answered.'];
	return [];
}

function previewInput(input: Record<string, unknown> | undefined): string {
	const text = JSON.stringify(input ?? {});
	if (text.length <= inputPreviewLength) return text;
	return `${text.slice(0, inputPreviewLength)}…`;
}
