import React, { useState } from "react";
import { SvgIcons } from "./SvgIcons";
import { FileDropzone } from "./FileDropzone";
import { StatusCard } from "./StatusCard";
import { formatBytes } from "../utils/helpers";

export function DecodingView({
  modality,
  stegoFile,
  stegoPreviewUrl,
  stegoTextSnippet,
  handleStegoChange,
  detectionModel,
  setDetectionModel,
  accessKey,
  setAccessKey,
  showAccessKey,
  setShowAccessKey,
  autoExtract,
  setAutoExtract,
  handleDecryptSubmit,
  job,
  error,
  recentActivity,
  isSubmitting,
  showToast
}) {
  const [stegoInputMode, setStegoInputMode] = useState("upload");
  const [pastedStegoText, setPastedStegoText] = useState("");

  const toggleStegoMode = (mode) => {
    setStegoInputMode(mode);
    setPastedStegoText("");
    handleStegoChange(null);
  };
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="section-kicker">extraction_protocol</span>
        <h1 className="panel-title" style={{ fontSize: "1.8rem" }}>Extraction Engine</h1>
        <p className="panel-subtitle">
          Upload carrier media to analyze and extract deep-embedded data layers.
        </p>
      </div>

      <form onSubmit={handleDecryptSubmit}>
        <div className="extraction-grid">
          {/* Left Upload Container */}
          <div>
            {modality === "text" && (
              <div className="tab-container" style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className={`tab-btn ${stegoInputMode === "upload" ? "active" : ""}`}
                  style={{ padding: "6px 16px", fontSize: "0.85rem", minHeight: "auto" }}
                  onClick={() => toggleStegoMode("upload")}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  className={`tab-btn ${stegoInputMode === "type" ? "active" : ""}`}
                  style={{ padding: "6px 16px", fontSize: "0.85rem", minHeight: "auto" }}
                  onClick={() => toggleStegoMode("type")}
                >
                  Paste Stego Text
                </button>
              </div>
            )}

            {modality === "text" && stegoInputMode === "type" ? (
              <div className="form-group">
                <span className="dropzone-label">Paste Stego Text Document</span>
                <textarea
                  className="cyber-textarea"
                  style={{
                    width: "100%",
                    minHeight: "200px",
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid var(--border-dim)",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                    outline: "none",
                    resize: "vertical"
                  }}
                  placeholder="Paste the stego text container file contents here..."
                  value={pastedStegoText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPastedStegoText(val);
                    if (val.trim()) {
                      const file = new File([val], "stego_pasted.txt", { type: "text/plain" });
                      handleStegoChange(file);
                    } else {
                      handleStegoChange(null);
                    }
                  }}
                />
              </div>
            ) : (
              <FileDropzone
                label="Carrier Media container"
                accept="image/*,audio/*,video/*,.txt,.md,.json"
                file={stegoFile}
                previewUrl={stegoPreviewUrl}
                textSnippet={stegoTextSnippet}
                onFileChange={handleStegoChange}
                helper="Supports .PNG, .JPG, .WAV, .MP4, or text formats. Maximum file size: 500MB."
                modality={modality}
                type="cover"
              />
            )}
          </div>

          {/* Right Parameters Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="params-card">
              <span className="params-card-title">Decoding Parameters</span>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="detectionModel">
                  AI Detection Model
                </label>
                <div className="input-glow-wrapper">
                  <select
                    id="detectionModel"
                    className="cyber-select"
                    value={detectionModel}
                    onChange={(e) => setDetectionModel(e.target.value)}
                  >
                    <option value="cyber-vision">Cyber-Vision v4.2 (Default)</option>
                    <option value="deep-spectral">Deep-Spectral Probe</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="accessKey">
                  Decryption Key (Optional)
                </label>
                <div className="input-glow-wrapper">
                  <input
                    id="accessKey"
                    type={showAccessKey ? "text" : "password"}
                    className="cyber-input"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="Enter decryption access key"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowAccessKey(!showAccessKey)}
                  >
                    {showAccessKey ? <SvgIcons.EyeOff /> : <SvgIcons.Eye />}
                  </button>
                </div>
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="cyber-checkbox"
                  checked={autoExtract}
                  onChange={(e) => setAutoExtract(e.target.checked)}
                />
                <span>Auto-extract known patterns</span>
              </label>

              <button
                className="btn-submit"
                type="submit"
                style={{ marginTop: 8 }}
                disabled={!stegoFile || isSubmitting || (job && (job.status === "queued" || job.status === "running"))}
              >
                {isSubmitting ? "Submitting..." : "Start Extraction"}
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          {job ? (
            <StatusCard job={job} />
          ) : (
            <div className="results-card-placeholder">
              <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                <SvgIcons.Search />
              </div>
              <span className="results-card-placeholder-text">
                Awaiting carrier file analysis to display results.
              </span>
            </div>
          )}
        </div>
      </form>

      {error ? (
        <div className="notification-card error" style={{ marginBottom: 24 }}>
          <div>❌</div>
          <div>{error}</div>
        </div>
      ) : null}

      {/* Session History */}
      <div className="session-history-container">
        <h2 className="history-header-title">Session History</h2>
        
        <div className="ops-table-wrapper">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Carrier File</th>
                <th>Engine</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock records */}
              <tr>
                <td>
                  <div className="file-name-col">
                    <div className="file-avatar">
                      <SvgIcons.Image />
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>DSC_0042.jpg</span>
                      <div className="file-name-meta">4.2 MB • Image/JPEG</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>Cyber-Vision v4.2</td>
                <td>
                  <span className="status-pill success">Success</span>
                </td>
                <td>12 mins ago</td>
                <td>
                  <button type="button" className="btn-view-report" onClick={() => showToast("Report: Decryption analysis matches neural carrier profiles. Signature matches SHA256 seals.", "info")}>
                    View Report
                  </button>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="file-name-col">
                    <div className="file-avatar">
                      <SvgIcons.Audio />
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>ambient_record.wav</span>
                      <div className="file-name-meta">12.8 MB • Audio/WAV</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>Deep-Spectral Probe</td>
                <td>
                  <span className="status-pill no-hidden">No Hidden Data</span>
                </td>
                <td>2 hours ago</td>
                <td>
                  <button type="button" className="topbar-icon-btn" onClick={() => showToast("Options configuration context under assembly.", "info")}>
                    ⋮
                  </button>
                </td>
              </tr>

              {/* Dynamic completed activities */}
              {recentActivity
                .filter(act => act.type === "decode")
                .map((op) => (
                  <tr key={op.id}>
                    <td>
                      <div className="file-name-col">
                        <div className="file-avatar">
                          {op.modality === "image" ? <SvgIcons.Image /> : op.modality === "audio" ? <SvgIcons.Audio /> : <SvgIcons.Video />}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{op.name}</span>
                          <div className="file-name-meta">{formatBytes(op.size)} • {op.modality.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                      {detectionModel === "cyber-vision" ? "Cyber-Vision v4.2" : "Deep-Spectral Probe"}
                    </td>
                    <td>
                      <span className={`status-pill ${op.status === "completed" ? "success" : "failed"}`}>
                        {op.status === "completed" ? "Success" : "Failed"}
                      </span>
                    </td>
                    <td>{op.timestamp}</td>
                    <td>
                      <button type="button" className="btn-view-report" onClick={() => showToast(`Job report: ID #${op.id} has completed with status: ${op.status}.`, "info")}>
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
