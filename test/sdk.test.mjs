import assert from "node:assert/strict";
import test from "node:test";
import { context, trace } from "@opentelemetry/api";
import { SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { setSdkFactoryForTesting } from "../dist/application/instrumentation.js";
import { configure, log, observe, shutdown, span } from "../dist/index.js";
import { resolveOtlpEndpoint } from "../dist/infrastructure/otlp/resolve-endpoint.js";

test("SDK resolves endpoint precedence and rejects invalid schemes", () => {
  assert.equal(
    resolveOtlpEndpoint(
      { endpoint: "https://explicit.example/" },
      {
        AGENT_OBSERVABILITY_ENDPOINT: "https://agent.example",
        OTEL_EXPORTER_OTLP_ENDPOINT: "https://otel.example",
      },
    ),
    "https://explicit.example",
  );
  assert.equal(
    resolveOtlpEndpoint({}, { AGENT_OBSERVABILITY_ENDPOINT: "https://agent.example" }),
    "https://agent.example",
  );
  assert.equal(resolveOtlpEndpoint({}, {}), "http://127.0.0.1:4318");
  assert.throws(() => resolveOtlpEndpoint({ endpoint: "file:///tmp/collector" }), /http or https/);
});

test("observe/span preserve return values, context, and thrown errors", async () => {
  const exportedSpans = [];
  const exportedLogs = [];
  const spanExporter = {
    export(spans, callback) {
      exportedSpans.push(...spans);
      callback({ code: 0 });
    },
    async forceFlush() {},
    async shutdown() {},
  };
  const logExporter = {
    export(logs, callback) {
      exportedLogs.push(...logs);
      callback({ code: 0 });
    },
    async forceFlush() {},
    async shutdown() {},
  };
  setSdkFactoryForTesting((configuration) => {
    return new NodeSDK({
      ...configuration,
      traceExporter: spanExporter,
      spanProcessors: [new SimpleSpanProcessor(spanExporter)],
      logRecordProcessors: [new SimpleLogRecordProcessor({ exporter: logExporter })],
    });
  });
  configure({ endpoint: "http://127.0.0.1:1", identity: { name: "test-agent", version: "1.2.3" } });

  const result = await observe("test-agent", async () => {
    const root = trace.getSpan(context.active());
    assert.ok(root);
    assert.equal(root.isRecording(), true);
    const rootContext = root.spanContext();
    return span(
      "search-tool",
      async () => {
        const child = trace.getSpan(context.active());
        assert.ok(child);
        assert.equal(child.spanContext().traceId, rootContext.traceId);
        log("info", "search started", { attempt: 1, provider: "catalog" });
        return "matched";
      },
      { type: "tool", attributes: { "tool.name": "search" } },
    );
  });
  assert.equal(result, "matched");

  const failure = new Error("agent failed");
  await assert.rejects(
    () => observe("failing-agent", () => Promise.reject(failure)),
    (error) => error === failure,
  );
  log("warn", "run finished", { retryable: false });
  await shutdown();
  assert.equal(exportedSpans.length, 3);
  assert.equal(exportedLogs.length, 2);
});
