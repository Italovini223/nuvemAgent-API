import { createMCPClient as createClient, type MCPClient } from "@ai-sdk/mcp";

const mcpUrl = process.env.MCP_SERVER_URL ?? "http://localhost:8080/sse";

export function createMcpClient(): Promise<MCPClient> {
  return createClient({
    name: "nuvem-agent-api",
    version: "1.0.0",
    transport: {
      type: "sse",
      url: mcpUrl,
    },
    onUncaughtError: (error) => {
      console.error("MCP client error", error);
    },
  });
}
