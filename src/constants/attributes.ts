/** Agent-specific attributes. The prefix remains provisional until the public wire contract is versioned. */
export const TELEMETRY_ATTRIBUTES = {
  agentName: "agent_observability.agent.name",
  spanType: "agent_observability.span.type",
  tokenCount: "agent_observability.usage.tokens",
  cost: "agent_observability.usage.cost",
} as const;

export const STANDARD_TELEMETRY_ATTRIBUTES = {
  serviceName: "service.name",
  genAiTotalTokens: "gen_ai.usage.total_tokens",
} as const;

