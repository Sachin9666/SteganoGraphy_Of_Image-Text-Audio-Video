import React, { useState } from "react";
import { SvgIcons } from "./SvgIcons";
import { buildArtifactUrl, downloadArtifact } from "../api";

export function StatusCard({ job }) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  if (!job) return null;

  const copyToClipboard = async (text, setCopied) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const isDecode = job.job_type === "decode";
  const steps = isDecode
    ? ["queued", "preparing", "inference", "securing", "enhancing", "done"]
    : ["queued", "preparing", "inference", "securing", "done"];
  const getStepClass = (stepName) => {
    const currentIdx = steps.indexOf(job.stage || "queued");
    const targetIdx = steps.indexOf(stepName);

    if (job.status === "failed") {
      return stepName === job.stage ? "pipeline-step active" : "pipeline-step";
    }

    if (job.status === "completed") {
      return "pipeline-step completed";
    }

    if (targetIdx < currentIdx) return "pipeline-step completed";
    if (targetIdx === currentIdx) return "pipeline-step active";
    return "pipeline-step";
  };

  return (
    <section className="glass-panel status-console">
      <div className="console-header">
        <div>
          <span className="section-kicker">engine_telemetry</span>
          <h3 style={{ textTransform: "uppercase", fontSize: "1.1rem" }}>
            {job.job_type === "encode" ? "Encoding Operation" : "Decoding Operation"}
          </h3>
        </div>
        <span className={`console-status-pill status-${job.status}`}>{job.status}</span>
      </div>

      <div className="console-progress">
        <div className="progress-label-row">
          <span>{job.message}</span>
          <span className="progress-pct">{job.progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${job.progress}%` }}></div>
        </div>
      </div>

      {/* Visual Pipeline Timeline */}
      <div className="pipeline-steps">
        <div className={getStepClass("queued")}>
          <div className="step-node">01</div>
          <span className="step-label">Queue</span>
        </div>
        <div className={getStepClass("preparing")}>
          <div className="step-node">02</div>
          <span className="step-label">Prepare</span>
        </div>
        <div className={getStepClass("inference")}>
          <div className="step-node">03</div>
          <span className="step-label">Model</span>
        </div>
        <div className={getStepClass("securing")}>
          <div className="step-node">04</div>
          <span className="step-label">{isDecode ? "Decrypt" : "Secure"}</span>
        </div>
        {isDecode && (
          <div className={getStepClass("enhancing")}>
            <div className="step-node">05</div>
            <span className="step-label">Enhance</span>
          </div>
        )}
        <div className={getStepClass("done")}>
          <div className="step-node">{isDecode ? "06" : "05"}</div>
          <span className="step-label">Ready</span>
        </div>
      </div>

      <div className="telemetry-grid">
        <div className="telemetry-item">
          <span className="telemetry-label">Processing Unit</span>
          <span className="telemetry-val" style={{ textTransform: "uppercase" }}>
            {job.device_info?.device ?? "Pending"}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Precision Config</span>
          <span className="telemetry-val">
            {job.device_info ? (job.device_info.mixed_precision ? "AMP FP16" : "FP32 Standard") : "Pending"}
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Job Token</span>
          <span className="telemetry-val">{job.job_id.slice(0, 12)}...</span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Active Modality</span>
          <span className="telemetry-val" style={{ textTransform: "uppercase" }}>
            {job.modality}
          </span>
        </div>
      </div>

      {job.device_info?.warning ? (
        <div className="notification-card warning" style={{ marginTop: 0, marginBottom: 20 }}>
          <div>⚠️</div>
          <div>{job.device_info.warning}</div>
        </div>
      ) : null}

      {job.access_key ? (
        <div className="terminal-block">
          <div className="terminal-head">
            <span className="terminal-title">
              <span className="health-dot" style={{ backgroundColor: "#39ff14" }}></span>
              SENDER_ACCESS_KEY
            </span>
            <button
              type="button"
              className={`btn-icon-copy ${copiedKey ? "copied" : ""}`}
              onClick={() => copyToClipboard(job.access_key, setCopiedKey)}
              title="Copy access key"
            >
              {copiedKey ? <SvgIcons.Check /> : <SvgIcons.Copy />}
            </button>
          </div>
          <div className="terminal-body">
            <div className="terminal-prompt">stegano-os:~$ cat key.vault</div>
            <div>{job.access_key}</div>
          </div>
        </div>
      ) : null}

      {job.integrity_hash ? (
        <div className="terminal-block" style={{ border: "1.5px solid rgba(0, 240, 255, 0.15)" }}>
          <div className="terminal-head">
            <span className="terminal-title" style={{ color: "var(--accent-cyan)" }}>
              <span className="health-dot" style={{ backgroundColor: "var(--accent-cyan)" }}></span>
              SHA256_INTEGRITY_HASH
            </span>
            <button
              type="button"
              className={`btn-icon-copy ${copiedHash ? "copied" : ""}`}
              onClick={() => copyToClipboard(job.integrity_hash, setCopiedHash)}
              title="Copy hash"
            >
              {copiedHash ? <SvgIcons.Check /> : <SvgIcons.Copy />}
            </button>
          </div>
          <div className="terminal-body" style={{ color: "var(--accent-cyan)" }}>
            <div className="terminal-prompt" style={{ color: "rgba(0, 240, 255, 0.5)" }}>stegano-os:~$ sha256sum artifact</div>
            <div>{job.integrity_hash}</div>
          </div>
        </div>
      ) : null}

      {job.status === "completed" && job.artifact_url ? (
        <div style={{ marginTop: 20 }}>
          <button
            type="button"
            className="btn-submit"
            onClick={async () => {
              setDownloading(true);
              setDownloadError("");
              try {
                const { blob, filename } = await downloadArtifact(job.job_id);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
                setDownloadError(err.message || "Failed to download artifact");
              } finally {
                setDownloading(false);
              }
            }}
            disabled={downloading}
          >
            {downloading ? "Downloading..." : "Download Result Artifact"}
          </button>
          {downloadError && (
            <div className="auth-error" style={{ marginTop: 8 }}>
              {downloadError}
            </div>
          )}
        </div>
      ) : null}

      {job.status === "failed" ? (
        <div className="notification-card error">
          <div>❌</div>
          <div>{job.message}</div>
        </div>
      ) : null}
    </section>
  );
}
