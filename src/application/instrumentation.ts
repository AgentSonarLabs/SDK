import { type Attributes, context, type Span, SpanStatusCode, trace } from "@opentelemetry/api";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { NodeSDK, type NodeSDKConfiguration } from "@opentelemetry/sdk-node";
import type { AgentLogLevel, AgentSpanType, TelemetryAttributes } from "../domain/types.js";
import { TELEMETRY_ATTRIBUTES } from "../infrastructure/otlp/attributes.js";
import { resolveOtlpEndpoint } from "../infrastructure/otlp/resolve-endpoint.js";
import { normalizeError } from "../shared/errors/normalize-error.js";
import type { AgentSpanOptions, TelemetryOptions } from "./telemetry-options.js";

const SCOPE_NAME = "agent-observability-sdk";
const LOG_SEVERITY: Record<AgentLogLevel, SeverityNumber> = {
  trace: SeverityNumber.TRACE,
  debug: SeverityNumber.DEBUG,
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR,
  fatal: SeverityNumber.FATAL,
};

let options: TelemetryOptions = {};
let sdk: NodeSDK | undefined;
let sdkFactory: (configuration: Partial<NodeSDKConfiguration>) => NodeSDK = (configuration) =>
  new NodeSDK(configuration);

/** Replace the SDK constructor in tests so spans and logs stay in memory. */
export function setSdkFactoryForTesting(
  factory: (configuration: Partial<NodeSDKConfiguration>) => NodeSDK,
): void {
  if (sdk) throw new Error("Telemetry has already been started");
  sdkFactory = factory;
}

export function configureTelemetry(next: TelemetryOptions = {}): void {
  if (sdk) return;
  options = {
    ...options,
    ...next,
    headers: { ...options.headers, ...next.headers },
    identity: next.identity ?? options.identity,
  };
}

export function setupTelemetry(next?: TelemetryOptions): void {
  configureTelemetry(next);
  ensureStarted();
}

export async function shutdownTelemetry(): Promise<void> {
  await sdk?.shutdown();
}

export function observe<T>(name: string, callback: () => T, spanOptions: AgentSpanOptions = {}): T {
  const identity = options.identity;
  return withSpan(name, callback, "agent", {
    [TELEMETRY_ATTRIBUTES.agentName]: identity?.name ?? name,
    ...toAttributes(spanOptions.attributes),
  });
}

export function span<T>(name: string, callback: () => T, spanOptions: AgentSpanOptions = {}): T {
  const type: AgentSpanType = spanOptions.type ?? "tool";
  return withSpan(name, callback, type, toAttributes(spanOptions.attributes));
}

export function log(
  level: AgentLogLevel,
  message: string,
  metadata: TelemetryAttributes = {},
): void {
  ensureStarted();
  logs.getLogger(SCOPE_NAME).emit({
    context: context.active(),
    severityNumber: LOG_SEVERITY[level],
    severityText: level.toUpperCase(),
    body: message,
    attributes: toAttributes(metadata),
  });
}

function withSpan<T>(
  name: string,
  callback: () => T,
  type: AgentSpanType,
  attributes: Attributes,
): T {
  ensureStarted();
  const tracer = trace.getTracer(SCOPE_NAME);
  return tracer.startActiveSpan(
    name,
    {
      attributes: {
        [TELEMETRY_ATTRIBUTES.spanType]: type,
        ...attributes,
      },
    },
    (activeSpan) => finishSpan(activeSpan, callback),
  );
}

function finishSpan<T>(activeSpan: Span, callback: () => T): T {
  try {
    const result = callback();
    if (isPromiseLike(result)) {
      return Promise.resolve(result)
        .then(
          (value) => {
            activeSpan.setStatus({ code: SpanStatusCode.OK });
            return value;
          },
          (error: unknown) => {
            recordFailure(activeSpan, error);
            throw error;
          },
        )
        .finally(() => activeSpan.end()) as T;
    }
    activeSpan.setStatus({ code: SpanStatusCode.OK });
    activeSpan.end();
    return result;
  } catch (error) {
    recordFailure(activeSpan, error);
    activeSpan.end();
    throw error;
  }
}

function recordFailure(activeSpan: Span, error: unknown): void {
  const normalized = normalizeError(error);
  activeSpan.recordException(normalized);
  activeSpan.setStatus({ code: SpanStatusCode.ERROR, message: normalized.message });
}

function ensureStarted(): void {
  if (sdk) return;
  const endpoint = resolveOtlpEndpoint(options);
  const resourceAttributes: Record<string, string> = {
    "service.name": options.identity?.name ?? "agent",
  };
  if (options.identity?.version) resourceAttributes["service.version"] = options.identity.version;
  if (options.identity?.environment)
    resourceAttributes["deployment.environment.name"] = options.identity.environment;

  sdk = sdkFactory({
    resource: resourceFromAttributes(resourceAttributes),
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
      headers: options.headers,
    }),
    logRecordProcessors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({ url: `${endpoint}/v1/logs`, headers: options.headers }),
      }),
    ],
  });
  sdk.start();
}

function toAttributes(attributes: TelemetryAttributes = {}): Attributes {
  return Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => [
      key,
      Array.isArray(value) ? [...value] : value,
    ]),
  ) as Attributes;
}

function isPromiseLike<T>(value: T): value is T & PromiseLike<Awaited<T>> {
  return (
    ((typeof value === "object" && value !== null) || typeof value === "function") &&
    typeof (value as { then?: unknown }).then === "function"
  );
}
