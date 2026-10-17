import type { ConnectorTool } from '$lib/ybt/ybtConnector';
import type { FunctionTool } from './chatMessages';

export function asFunctionTools(connectorTools: ConnectorTool[]): FunctionTool[] {
	return connectorTools.map((tool) => ({
		type: 'function',
		function: { name: tool.name, description: tool.description, parameters: tool.inputSchema }
	}));
}
