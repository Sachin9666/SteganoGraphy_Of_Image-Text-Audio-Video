import { useEffect, useRef, useState } from "react";

import { buildArtifactUrl, createDecodeJob, createEncodeJob, fetchJob } from "./api";
import { FILE_LIMITS } from "./config";

const MODALITIES = ["image", "audio", "video", "text"];
const ACTIVITY_ITEMS = [
  { name: "IMG_8829_ENCRYPTED.PNG", meta: "SIZE: 4.2 MB | ALGO: LSB-R", status: "secure" },
  { name: "TRANSACTION_RECOVERY_01.MP4", meta: "SIZE: 128.5 MB | ALGO: FREQ-ANALYTIC", status: "extract" },
  { name: "SECRET_COMM_042.WAV", meta: "SIZE: 1.1 MB | ALGO: ECHO-STEG", status: "compromised" },
];

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const order = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** order).toFixed(order === 0 ? 0 : 1)} ${units[order]}`;
}

function FileDropzone({ label, accept, file, onFileChange, helper, caption }) {
  const inputRef = useRef(null);

  return (
    <section className="operation-card">
      <div className="operation-head">
        <span className="operation-icon">{file ? "OK" : "UP"}</span>
        <div>
          <p className="operation-step">{caption}</p>
          <h3>{label}</h3>
        </div>
      </div>
      <div
        className="dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) onFileChange(dropped);
        }}
      >
        <input
          ref={inputRef}
          className="hidden-input"
          type="file"
          accept={accept}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) onFileChange(selected);
          }}
        />
        <div className="dropzone-glyph">{file ? "[]" : "<>"}</div>
        <p className="dropzone-helper">{helper}</p>
        <p className="dropzone-file">
          {file ? `${file.name} | ${formatBytes(file.size)}` : "Drag and drop or click to browse"}
        </p>
      </div>
    </section>
  );
}

function StatusCard({ job }) {
  if (!job) return null;

  return (
    <section className="status-console">
      <div className="console-head">
        <div>
          <p className="console-kicker">signal_telemetry</p>
          <h3>{job.message}</h3>
        </div>
        <span className={`status-pill status-${job.status}`}>{job.status}</span>
      </div>
      <div className="console-statline">
        <div>
          <span>PROCESS</span>
          <strong>{job.progress}%</strong>
        </div>
        <div>
          <span>EST REMAINING</span>
          <strong>{job.status === "completed" ? "0.0s" : "active"}</strong>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${job.progress}%` }} />
      </div>
      <div className="meta-grid">
        <div>
          <span>Stage</span>
          <strong>{job.stage}</strong>
        </div>
        <div>
          <span>Runtime</span>
          <strong>{job.device_info?.device ?? "pending"}</strong>
        </div>
        <div>
          <span>Precision</span>
          <strong>{job.device_info?.mixed_precision ? "FP16" : "standard"}</strong>
        </div>
        <div>
          <span>Integrity</span>
          <strong>{job.integrity_hash ? `${job.integrity_hash.slice(0, 14)}...` : "pending"}</strong>
        </div>
      </div>
      {job.device_info?.warning ? <p className="warning">{job.device_info.warning}</p> : null}
      {job.access_key ? (
        <div className="terminal-card">
          <p className="console-kicker">extracted_payload</p>
          <div className="terminal-window">
            <p>system@stegano-os:$ cat access_key.sec</p>
            <p>{job.access_key}</p>
          </div>
        </div>
      ) : null}
      {job.status === "completed" && job.artifact_url ? (
        <a className="primary-button" href={buildArtifactUrl(job.job_id)}>
          Download Artifact
        </a>
      ) : null}
      {job.status === "failed" ? <p className="error-message">{job.message}</p> : null}
    </section>
  );
}

function TelemetryPanel({ activeTab, modality, job }) {
  const modalityLabel = modality.toUpperCase();
  const queueValue = job?.status === "queued" ? 1 : 0;
  const gpuLoad = job ? `${Math.max(job.progress, 12)}%` : "98.4%";

  return (
    <aside className="telemetry-column">
      <section className="telemetry-card telemetry-primary">
        <p className="console-kicker">processing node</p>
        <h2>{activeTab === "encrypt" ? "ENCRYPTION ENGINE" : "DATA EXTRACTION PROTOCOL"}</h2>
        <div className="telemetry-split">
          <div>
            <span>GPU LOAD</span>
            <strong>{gpuLoad}</strong>
          </div>
          <div>
            <span>QUEUE</span>
            <strong>{queueValue}</strong>
          </div>
        </div>
      </section>

      <section className="telemetry-card">
        <p className="console-kicker">memory</p>
        <div className="mini-progress">
          <div className="mini-progress-fill" style={{ width: job ? `${Math.max(job.progress, 42)}%` : "42%" }} />
        </div>
        <div className="telemetry-inline">
          <strong>{job ? `${job.progress}%` : "42%"}</strong>
          <span>{job ? `${job.progress}% pipeline allocation` : "13.4GB / 32GB allocated"}</span>
        </div>
      </section>

      <section className="telemetry-card">
        <p className="console-kicker">encryption level</p>
        <h3>{activeTab === "encrypt" ? "AES-4096" : "KEY VALIDATION"}</h3>
        <p className="secure-line">secure_link_established</p>
      </section>

      <section className={`feature-card ${activeTab === "encrypt" ? "feature-encrypt" : "feature-decrypt"}`}>
        <p className="feature-icon">{activeTab === "encrypt" ? "LOCK" : "OPEN"}</p>
        <h3>{activeTab === "encrypt" ? "ENCRYPT NEW MEDIA" : "DECRYPT & EXTRACT"}</h3>
        <p>
          {activeTab === "encrypt"
            ? `Inject stealth payloads into ${modality} carriers with model-backed embedding and key-bound recovery.`
            : `Recover hidden payloads from protected ${modality} carriers with cryptographic validation.`}
        </p>
      </section>

      <section className="telemetry-card">
        <div className="activity-head">
          <div>
            <p className="console-kicker">telemetry log</p>
            <h3>Recent Activity</h3>
          </div>
          <span className="archive-link">view full archive</span>
        </div>
        <div className="activity-list">
          {ACTIVITY_ITEMS.map((item) => (
            <div className="activity-item" key={item.name}>
              <div className="activity-icon">{item.name.slice(0, 2)}</div>
              <div className="activity-copy">
                <strong>{item.name}</strong>
                <span>{item.meta}</span>
              </div>
              <span className={`activity-badge badge-${item.status}`}>{item.status}</span>
            </div>
          ))}
          {job ? (
            <div className="activity-item live">
              <div className="activity-icon">JB</div>
              <div className="activity-copy">
                <strong>{job.output_name ?? `${modalityLabel}_JOB_${job.job_id.slice(0, 8)}`}</strong>
                <span>{job.message}</span>
              </div>
              <span className={`activity-badge badge-${job.status}`}>{job.status}</span>
            </div>
          ) : null}
        </div>
      </section>
    </aside>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("encrypt");
  const [modality, setModality] = useState("image");
  const [coverFile, setCoverFile] = useState(null);
  const [secretFile, setSecretFile] = useState(null);
  const [stegoFile, setStegoFile] = useState(null);
  const [embeddingType, setEmbeddingType] = useState("adaptive");
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!job?.job_id || job.status === "completed" || job.status === "failed") {
      return undefined;
    }

    const timer = window.setInterval(async () => {
      try {
        const updated = await fetchJob(job.job_id);
        setJob(updated);
      } catch (pollError) {
        setError(pollError.message);
      }
    }, 1500);

    return () => window.clearInterval(timer);
  }, [job]);

  function validateFile(file, targetModality) {
    const limit = FILE_LIMITS[targetModality];
    if (file.size > limit) {
      throw new Error(`${file.name} exceeds the ${formatBytes(limit)} limit for ${targetModality}.`);
    }
  }

  async function handleEncryptSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (!coverFile || !secretFile) {
        throw new Error("Select both the cover file and secret payload.");
      }

      validateFile(coverFile, modality);
      const created = await createEncodeJob({ modality, coverFile, secretFile, embeddingType });
      setJob({ ...created, progress: 0, stage: "queued" });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleDecryptSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (!stegoFile || !accessKey.trim()) {
        throw new Error("Provide the stego file and access key.");
      }

      validateFile(stegoFile, modality);
      const created = await createDecodeJob({ modality, stegoFile, accessKey });
      setJob({ ...created, progress: 0, stage: "queued" });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>StegaVault</span>
        </div>
        <div className="status-chip">GPU:ACTIVE</div>
      </header>

      <section className="panel-grid">
        <section className="control-panel shell-panel">
          <div className="tab-row">
            <button
              className={activeTab === "encrypt" ? "tab active" : "tab"}
              onClick={() => setActiveTab("encrypt")}
              type="button"
            >
              Encrypt
            </button>
            <button
              className={activeTab === "decrypt" ? "tab active" : "tab"}
              onClick={() => setActiveTab("decrypt")}
              type="button"
            >
              Decrypt
            </button>
          </div>

          <section className="title-block">
            <p className="console-kicker">{activeTab === "encrypt" ? "core_protocol" : "process // 01"}</p>
            <div className="title-row">
              <h1>{activeTab === "encrypt" ? "ENCRYPTION ENGINE" : "Data Extraction Protocol"}</h1>
              <div className="secure-indicator">secure_link_established</div>
            </div>
            <p className="title-copy">
              {activeTab === "encrypt"
                ? "Initialize cover selection, inject protected payloads, and preserve media quality under production constraints."
                : "Validate bound keys, analyze artifact integrity, and recover the embedded payload through the decoder pipeline."}
            </p>
          </section>

          <section className="operation-card">
            <div className="operation-head">
              <span className="operation-icon">MD</span>
              <div>
                <p className="operation-step">00 / routing</p>
                <h3>Modality Selection</h3>
              </div>
            </div>
            <label className="field">
              <span>Target modality</span>
              <select value={modality} onChange={(event) => setModality(event.target.value)}>
                {MODALITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {activeTab === "encrypt" ? (
            <form className="stack" onSubmit={handleEncryptSubmit}>
              <FileDropzone
                label="Cover Carrier Selection"
                accept="image/*,audio/*,video/*,.txt,.md,.json"
                file={coverFile}
                onFileChange={(file) => setCoverFile(file)}
                helper={`Limit: ${formatBytes(FILE_LIMITS[modality])}`}
                caption="01 / stage"
              />
              <FileDropzone
                label="Secret Payload Injection"
                accept=".txt,.json,.bin,image/*,audio/*"
                file={secretFile}
                onFileChange={(file) => setSecretFile(file)}
                helper="Encrypted with AES-GCM before storage in the stego container."
                caption="02 / data"
              />
              <section className="operation-card">
                <div className="operation-head">
                  <span className="operation-icon">AI</span>
                  <div>
                    <p className="operation-step">03 / compute</p>
                    <h3>Encoding Intensity</h3>
                  </div>
                </div>
                <label className="field">
                  <span>Embedding profile</span>
                  <select value={embeddingType} onChange={(event) => setEmbeddingType(event.target.value)}>
                    <option value="adaptive">Adaptive quality-preserving</option>
                    <option value="balanced">Balanced throughput</option>
                    <option value="capacity">High-capacity experimental</option>
                  </select>
                </label>
                <button className="primary-button" type="submit">
                  Queue Encoding Job
                </button>
              </section>
            </form>
          ) : (
            <form className="stack" onSubmit={handleDecryptSubmit}>
              <FileDropzone
                label="Upload Stego File"
                accept="image/*,audio/*,video/*,.txt,.md,.json"
                file={stegoFile}
                onFileChange={(file) => setStegoFile(file)}
                helper={`Limit: ${formatBytes(FILE_LIMITS[modality])}`}
                caption="01 / source_identification"
              />
              <section className="operation-card">
                <div className="operation-head">
                  <span className="operation-icon">KY</span>
                  <div>
                    <p className="operation-step">02 / cryptographic_challenge</p>
                    <h3>Secure Access Key</h3>
                  </div>
                </div>
                <label className="field">
                  <span>Access key</span>
                  <input
                    value={accessKey}
                    onChange={(event) => setAccessKey(event.target.value)}
                    placeholder="Paste the sender-provided key"
                  />
                </label>
                <button className="primary-button" type="submit">
                  Queue Decoding Job
                </button>
              </section>
            </form>
          )}

          {job ? <StatusCard job={job} /> : null}
          {error ? <p className="error-message">{error}</p> : null}
        </section>

        <TelemetryPanel activeTab={activeTab} modality={modality} job={job} />
      </section>

      
    </main>
  );
}
