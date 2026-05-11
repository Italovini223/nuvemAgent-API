import { Client } from "@modelcontextprotocol/sdk/client/index";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse";

const mcpUrl = process.env.MCP_SERVER_URL ?? "http://localhost:8080/sse";

export async function createMcpPromptClient() {
  const client = new Client({
    name: "nuvem-agent-api",
    version: "1.0.0",
  });

  const transport = new SSEClientTransport(new URL(mcpUrl));
  await client.connect(transport);

  const close = async () => {
    try {
      await client.close();
    } catch {
      // ignore
    }

    try {
      await transport.close();
    } catch {
      // ignore
    }
  };

  return { client, close };
}
