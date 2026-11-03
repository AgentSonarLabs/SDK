import type { LOG_LEVELS, SPAN_TYPES } from "../constants/telemetry.js";

export type AgentSpanType = (typeof SPAN_TYPES)[number];
export type AgentLogLevel = (typeof LOG_LEVELS)[number];

export type TelemetryAttributeValue = string | number | boolean | readonly string[];
export type TelemetryAttributes = Record<string, TelemetryAttributeValue>;

export interface AgentIdentity {
  name: string;
  version?: string;
  environment?: string;
}

