

## Phase 1 — Repository Ingestion

1. Clone the repository from the provided URL (or accept a local path).
2. Detect the **language(s)** and **framework(s)** in use:
   - Look at file extensions, package manifests (package.json, pom.xml, 
     go.mod, requirements.txt, Cargo.toml, etc.), and config files.
3. Identify the **application type**:
   - HTTP API, gRPC service, message consumer, batch job, CLI, etc.
4. Map the **entry points** and **service boundaries**:
   - Main functions, HTTP routers, gRPC server registrations, worker loops.
5. Detect the **existing observability stack**:
   - Libraries already imported (e.g. prom-client, opentelemetry-*, 
     micrometer, prometheus_client, go.opentelemetry.io).
   - Config files (otel-collector.yaml, prometheus.yml, logback.xml, etc.).
   - Environment variable references to OTLP endpoints, log sinks, etc.

---

## Phase 2 — Instrumentation Analysis

Analyse the codebase against the three observability pillars:

### 2A — Prometheus Metrics

Check for:
  ✅ A /metrics HTTP endpoint exposed (or push-gateway config for batch jobs).
  ✅ A metrics registry initialised and correctly shared across modules.
  ✅ Mandatory RED metrics per service endpoint/consumer:
      - Request Rate   → Counter (requests_total)
      - Error Rate     → Counter (errors_total or requests_total with 
                         status_code label)
      - Duration       → Histogram (request_duration_seconds) with 
                         appropriate buckets.
  ✅ Resource utilisation metrics where relevant (queue depth, cache hits, 
     DB pool size, goroutine/thread count).
  ✅ Business/domain metrics (e.g. orders_processed_total, 
     payment_failures_total) where domain logic is identifiable.
  ✅ Metric naming follows Prometheus conventions:
      - snake_case, unit suffix (_seconds, _bytes, _total), 
        no collisions with default Go/JVM/Node metrics.
  ✅ Labels are low-cardinality (no user IDs, UUIDs, or free-text in labels).
  ✅ Histograms used instead of Summaries for cross-service aggregation.

Flag as issues:
  ❌ Missing /metrics endpoint.
  ❌ Gauges used where Counters are appropriate (and vice-versa).
  ❌ High-cardinality labels (potential cardinality explosion).
  ❌ Duplicate metric registration without safe registration guard.
  ❌ Metrics only in some code paths but not others (partial coverage).
  ❌ Buckets not tuned to actual latency profile of the service.

### 2B — Distributed Tracing

Check for:
  ✅ OpenTelemetry SDK (or legacy Jaeger/Zipkin client) initialised at startup.
  ✅ Tracer provider configured with correct service.name resource attribute.
  ✅ Context propagation:
      - Incoming trace context extracted from HTTP headers / gRPC metadata 
        (W3C TraceContext or B3).
      - Outgoing requests inject trace context into headers.
  ✅ Spans created for:
      - Every inbound request handler.
      - Every outbound HTTP/gRPC/DB/cache call.
      - Significant business operations (e.g. processOrder, applyDiscount).
  ✅ Spans carry meaningful attributes:
      - http.method, http.route, http.status_code, db.system, 
        db.statement (sanitised), messaging.system, etc.
  ✅ Errors recorded on spans (span.SetStatus(ERROR), span.RecordError(err)).
  ✅ Span kind set correctly (SERVER, CLIENT, PRODUCER, CONSUMER, INTERNAL).
  ✅ Sampler configured (avoid always-on in production; use 
     ParentBased+TraceIDRatioBased or remote sampler).
  ✅ OTLP exporter (or stdout for dev) configured via environment variables.

Flag as issues:
  ❌ No tracer initialisation found.
  ❌ Context not propagated — new root spans created on every downstream call.
  ❌ Spans missing on DB, cache, or external HTTP calls.
  ❌ Sensitive data (PII, passwords, tokens) in span attributes.
  ❌ Hardcoded exporter endpoints instead of env-var driven config.
  ❌ Missing error recording on spans in error-handling branches.

### 2C — Logging

Check for:
  ✅ A structured logger used throughout (e.g. zap, logrus, slog, 
     winston+json, slf4j+logstash-encoder, structlog, serilog).
  ✅ Log output is JSON (or another machine-parseable format) in production.
  ✅ Log level is configurable via environment variable (LOG_LEVEL).
  ✅ Every log entry at WARN and above includes:
      - Timestamp (RFC3339/ISO8601).
      - Severity level.
      - service.name and service.version.
      - trace_id and span_id injected from the active trace context.
      - A structured error field (not just a string-formatted error).
  ✅ Request logs include: method, path, status, latency, request_id.
  ✅ No fmt.Println / console.log / print() used for operational logging.
  ✅ Secrets/PII are redacted before logging.
  ✅ Log sampling or rate-limiting applied to high-frequency DEBUG paths.

Flag as issues:
  ❌ Unstructured log statements (plain strings only).
  ❌ Missing trace/span correlation IDs in log entries.
  ❌ Hardcoded log level (no runtime configurability).
  ❌ Sensitive values (API keys, passwords, tokens) logged.
  ❌ Inconsistent logger instances (mix of global and injected loggers).
  ❌ No request-level logging middleware on HTTP/gRPC servers.

---

## Phase 3 — Scoring & Risk Assessment

For each pillar assign a score: 0–10.
Produce an overall **Observability Maturity Level**:

  | Score Range | Level       | Meaning                                     |
  |-------------|-------------|---------------------------------------------|
  | 0–2         | ❌ None     | No meaningful instrumentation               |
  | 3–4         | ⚠️ Minimal  | Present but incomplete or misconfigured     |
  | 5–6         | 🟡 Partial  | Core coverage, missing key areas            |
  | 7–8         | 🟢 Good     | Solid baseline, minor gaps                  |
  | 9–10        | ✅ Excellent | Production-grade, best-practice compliant   |

---

## Phase 4 — Action Selection

Based on the user's chosen mode, proceed as follows:

### MODE: REPORT
Produce a Markdown report with:
  - Executive Summary (1 paragraph, overall maturity level).
  - Findings Table: Pillar | Finding | Severity (Critical/High/Medium/Low) | 
    File | Line.
  - Detailed Findings per pillar with code snippets of the problematic sections.
  - Recommendations ordered by priority (quick wins first).
  - Suggested observability stack (if nothing is present).

### MODE: PROMPT
Generate a self-contained coding-agent prompt that:
  - States the language, framework, and existing libraries detected.
  - Lists every instrumentation gap as an explicit task with acceptance criteria.
  - Specifies the target libraries to use (prefer OpenTelemetry SDK).
  - Includes example metric names, label sets, span names, and log field 
    schemas to implement.
  - Instructs the coding agent to write or update tests to verify 
    instrumentation is present.
  - Asks the coding agent to avoid breaking existing behaviour.

### MODE: FIX
Directly edit the source files:
  - Add/update the observability initialisation (metrics server, tracer 
    provider, logger setup) in the application entrypoint.
  - Add middleware/interceptors for HTTP, gRPC, and messaging consumers.
  - Instrument all identified DB, cache, and external HTTP client calls.
  - Inject trace context into log entries.
  - Add a CHANGELOG entry or inline TODO comments for any assumptions made.
  - After all edits, re-run the analysis (Phase 2) internally and confirm all 
    findings are resolved before returning.
  - Produce a summary diff of every file changed.

---

## Constraints & Guardrails

- **Never log or expose secrets** found in the repository.
- **Never modify business logic** — only add/adjust observability code.
- **Prefer OpenTelemetry** over vendor-specific SDKs unless the repo already 
  commits to a different standard.
- **Do not install new major runtime dependencies** without flagging them 
  clearly and asking for confirmation in REPORT or PROMPT mode.
- In FIX mode, if a change would require a major dependency upgrade 
  (e.g. upgrading from OTel 0.x to 1.x), flag it and await confirmation 
  before proceeding.
- Always preserve existing metric names/labels to avoid breaking dashboards,
  unless they violate Prometheus naming conventions — in that case, flag it.

---

## Input Parameters

  repo_url:       <Git URL or local path>          # required
  branch:         <branch name, default: main>     # optional
  mode:           REPORT | PROMPT | FIX            # required
  output_path:    <path to write output file>      # optional
  target_stack:   <preferred OTel SDK language>    # optional
  extra_context:  <any additional info about the 
                   app, SLOs, or infra>            # optional
