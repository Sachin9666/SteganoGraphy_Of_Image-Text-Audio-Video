import React, { useState } from "react";
import { SvgIcons } from "./SvgIcons";
import { FileDropzone } from "./FileDropzone";
import { StatusCard } from "./StatusCard";
import { formatBytes } from "../utils/helpers";
import { FILE_LIMITS, SECRET_LIMITS } from "../config";

export function EncodingView({
  modality,
  handleModalityChange,
  coverFile,
  coverPreviewUrl,
  coverTextSnippet,
  handleCoverChange,
  secretFile,
  secretPreviewUrl,
  secretTextSnippet,
  handleSecretChange,
  embeddingType,
  setEmbeddingType,
  encodingStep,
  setEncodingStep,
  job,
  handleEncryptSubmit,
  error,
  isSubmitting
}) {
  const [carrierInputMode, setCarrierInputMode] = useState("upload");
  const [typedCarrierText, setTypedCarrierText] = useState("");
  const [secretInputMode, setSecretInputMode] = useState("upload");
  const [typedSecretText, setTypedSecretText] = useState("");

  const toggleCarrierMode = (mode) => {
    setCarrierInputMode(mode);
    setTypedCarrierText("");
    handleCoverChange(null);
  };

  const toggleSecretMode = (mode) => {
    setSecretInputMode(mode);
    setTypedSecretText("");
    handleSecretChange(null);
  };

  return (
    <section className="glass-panel" style={{ background: "#ffffff", border: "1px solid var(--border-dim)" }}>
      <div style={{ marginBottom: 24 }}>
        <span className="section-kicker">secure_encoding_protocol</span>
        <h1 className="panel-title" style={{ fontSize: "1.8rem" }}>Secure Encoding</h1>
        <p className="panel-subtitle">
          Embed sensitive data into carrier media using advanced neural steganography.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="stepper-container">
        <div className={`stepper-step ${encodingStep === 1 ? "active" : encodingStep > 1 ? "completed" : ""}`}>
          <div className="step-circle">1</div>
          <div className="step-info">
            <span className="step-title">Carrier Media</span>
            <span className="step-subtitle">Select host file</span>
          </div>
        </div>
        <div className={`step-line ${encodingStep > 1 ? "completed" : ""}`}></div>

        <div className={`stepper-step ${encodingStep === 2 ? "active" : encodingStep > 2 ? "completed" : ""}`}>
          <div className="step-circle">2</div>
          <div className="step-info">
            <span className="step-title">Secret Data</span>
            <span className="step-subtitle">Input payload</span>
          </div>
        </div>
        <div className={`step-line ${encodingStep > 2 ? "completed" : ""}`}></div>

        <div className={`stepper-step ${encodingStep === 3 ? "active" : encodingStep > 3 ? "completed" : ""}`}>
          <div className="step-circle">3</div>
          <div className="step-info">
            <span className="step-title">Neural Model</span>
            <span className="step-subtitle">Choose algorithm</span>
          </div>
        </div>
        <div className={`step-line ${encodingStep > 3 ? "completed" : ""}`}></div>

        <div className={`stepper-step ${encodingStep === 4 ? "active" : ""}`}>
          <div className="step-circle">4</div>
          <div className="step-info">
            <span className="step-title">Finalize</span>
            <span className="step-subtitle">Preview output</span>
          </div>
        </div>
      </div>

      {/* Stepper Steps Switcher */}
      <form onSubmit={handleEncryptSubmit}>
        {encodingStep === 1 && (
          <div>
            {/* Large Modality Cards */}
            <div className="modality-cards-large-grid">
              <div
                className={`modality-card-large ${modality === "image" ? "active" : ""}`}
                onClick={() => handleModalityChange("image")}
              >
                <div className="modality-card-large-icon">
                  <SvgIcons.Image />
                </div>
                <span className="modality-card-large-title">Image</span>
                <p className="modality-card-large-desc">Embed data in PNG, JPEG, or RAW files using pixel-mod neural shifts.</p>
              </div>

              <div
                className={`modality-card-large ${modality === "video" ? "active" : ""}`}
                onClick={() => handleModalityChange("video")}
              >
                <div className="modality-card-large-icon">
                  <SvgIcons.Video />
                </div>
                <span className="modality-card-large-title">Video</span>
                <p className="modality-card-large-desc">Utilize temporal coherence in MP4/AVI streams for higher capacity.</p>
              </div>

              <div
                className={`modality-card-large ${modality === "audio" ? "active" : ""}`}
                onClick={() => handleModalityChange("audio")}
              >
                <div className="modality-card-large-icon">
                  <SvgIcons.Audio />
                </div>
                <span className="modality-card-large-title">Audio</span>
                <p className="modality-card-large-desc">Imperceptible frequency modulation in WAV/FLAC containers.</p>
              </div>

              <div
                className={`modality-card-large ${modality === "text" ? "active" : ""}`}
                onClick={() => handleModalityChange("text")}
              >
                <div className="modality-card-large-icon">
                  <SvgIcons.Text />
                </div>
                <span className="modality-card-large-title">Text Document</span>
                <p className="modality-card-large-desc">Inject hidden bytes into whitespace or semantic structures of text files.</p>
              </div>
            </div>



            {modality === "text" && (
              <div className="tab-container" style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className={`tab-btn ${carrierInputMode === "upload" ? "active" : ""}`}
                  style={{ padding: "6px 16px", fontSize: "0.85rem", minHeight: "auto" }}
                  onClick={() => toggleCarrierMode("upload")}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  className={`tab-btn ${carrierInputMode === "type" ? "active" : ""}`}
                  style={{ padding: "6px 16px", fontSize: "0.85rem", minHeight: "auto" }}
                  onClick={() => toggleCarrierMode("type")}
                >
                  Type Text
                </button>
              </div>
            )}

            {modality === "text" && carrierInputMode === "type" ? (
              <div className="form-group">
                <span className="dropzone-label">Type Host Text Content</span>
                <textarea
                  className="cyber-textarea"
                  style={{
                    width: "100%",
                    minHeight: "180px",
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
                  placeholder="Type or paste the host text document content here..."
                  value={typedCarrierText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypedCarrierText(val);
                    if (val.trim()) {
                      const file = new File([val], "carrier_typed.txt", { type: "text/plain" });
                      handleCoverChange(file);
                    } else {
                      handleCoverChange(null);
                    }
                  }}
                />
              </div>
            ) : (
              <FileDropzone
                label="Upload Carrier Media"
                accept={
                  modality === "image"
                    ? "image/*"
                    : modality === "audio"
                    ? "audio/*"
                    : modality === "video"
                    ? "video/*"
                    : "image/*,.txt,.md,.json"
                }
                file={coverFile}
                previewUrl={coverPreviewUrl}
                textSnippet={coverTextSnippet}
                onFileChange={handleCoverChange}
                helper={`Drag and drop or click to browse files (Max ${formatBytes(FILE_LIMITS[modality])})`}
                modality={modality}
                type="cover"
              />
            )}

            {/* Format Badges */}
            {!(modality === "text" && carrierInputMode === "type") && !coverFile && (
              <div className="dropzone-badges-row" style={{ marginTop: 8, marginBottom: 16 }}>
                {modality === "image" && (
                  <>
                    <span className="dropzone-badge">.PNG</span>
                    <span className="dropzone-badge">.RAW</span>
                    <span className="dropzone-badge">.JPG</span>
                  </>
                )}
                {modality === "video" && (
                  <>
                    <span className="dropzone-badge">.MP4</span>
                    <span className="dropzone-badge">.MOV</span>
                    <span className="dropzone-badge">.AVI</span>
                  </>
                )}
                {modality === "audio" && (
                  <>
                    <span className="dropzone-badge">.WAV</span>
                    <span className="dropzone-badge">.MP3</span>
                    <span className="dropzone-badge">.FLAC</span>
                  </>
                )}
                {modality === "text" && (
                  <>
                    <span className="dropzone-badge">.TXT</span>
                    <span className="dropzone-badge">.MD</span>
                    <span className="dropzone-badge">.JSON</span>
                  </>
                )}
              </div>
            )}

            <div className="stepper-actions-row">
              <button
                type="button"
                className="btn-stepper-next"
                disabled={!coverFile}
                onClick={() => setEncodingStep(2)}
              >
                Next: Secret Data <SvgIcons.ArrowRight />
              </button>
            </div>
          </div>
        )}

        {encodingStep === 2 && (
          <div>
            {modality === "text" && (
              <div className="tab-container" style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className={`tab-btn ${secretInputMode === "upload" ? "active" : ""}`}
                  style={{ padding: "6px 16px", fontSize: "0.85rem", minHeight: "auto" }}
                  onClick={() => toggleSecretMode("upload")}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  className={`tab-btn ${secretInputMode === "type" ? "active" : ""}`}
                  style={{ padding: "6px 16px", fontSize: "0.85rem", minHeight: "auto" }}
                  onClick={() => toggleSecretMode("type")}
                >
                  Type Message
                </button>
              </div>
            )}

            {modality === "text" && secretInputMode === "type" ? (
              <div className="form-group">
                <span className="dropzone-label">Type Secret Payload Message</span>
                <textarea
                  className="cyber-textarea"
                  style={{
                    width: "100%",
                    minHeight: "180px",
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
                  placeholder="Type or paste the secret message you want to hide here..."
                  value={typedSecretText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypedSecretText(val);
                    if (val.trim()) {
                      const file = new File([val], "secret_typed.txt", { type: "text/plain" });
                      handleSecretChange(file);
                    } else {
                      handleSecretChange(null);
                    }
                  }}
                />
              </div>
            ) : (
              <FileDropzone
                label="Upload Secret Payload"
                accept=".txt,.json,.bin,image/*,audio/*"
                file={secretFile}
                previewUrl={secretPreviewUrl}
                textSnippet={secretTextSnippet}
                onFileChange={handleSecretChange}
                helper={`Secured with AES-GCM encryption. Maximum payload size: ${formatBytes(
                  SECRET_LIMITS[modality]
                )}`}
                modality={modality}
                type="secret"
              />
            )}

            <div className="stepper-actions-row">
              <button
                type="button"
                className="btn-stepper-back"
                onClick={() => setEncodingStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-stepper-next"
                disabled={!secretFile}
                onClick={() => setEncodingStep(3)}
              >
                Next: Neural Model <SvgIcons.ArrowRight />
              </button>
            </div>
          </div>
        )}

        {encodingStep === 3 && (
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="embeddingType">
                Select Neural Embedding Configuration
              </label>
              <div className="input-glow-wrapper">
                <select
                  id="embeddingType"
                  className="cyber-select"
                  value={embeddingType}
                  onChange={(e) => setEmbeddingType(e.target.value)}
                >
                  <option value="fast">⚡ Fast (Bypass Neural Inference - Instant)</option>
                  <option value="adaptive">Adaptive Quality-Preserving (Highest PSNR)</option>
                  <option value="balanced">Balanced Throughput / Capacity</option>
                  <option value="capacity">High-Capacity Experimental (Max secret size)</option>
                </select>
              </div>
            </div>

            <div className="stepper-actions-row">
              <button
                type="button"
                className="btn-stepper-back"
                onClick={() => setEncodingStep(2)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-stepper-next"
                onClick={() => setEncodingStep(4)}
              >
                Next: Finalize <SvgIcons.ArrowRight />
              </button>
            </div>
          </div>
        )}

        {encodingStep === 4 && (
          <div>
            {job ? (
              <StatusCard job={job} />
            ) : (
              <div>
                <div className="finalize-checklist">
                  <div className="finalize-item">
                    <span className="finalize-lbl">Carrier Modality</span>
                    <span className="finalize-val" style={{ textTransform: "uppercase" }}>{modality}</span>
                  </div>
                  <div className="finalize-item">
                    <span className="finalize-lbl">Carrier File</span>
                    <span className="finalize-val">{coverFile?.name} ({formatBytes(coverFile?.size)})</span>
                  </div>
                  <div className="finalize-item">
                    <span className="finalize-lbl">Secret Payload</span>
                    <span className="finalize-val">{secretFile?.name} ({formatBytes(secretFile?.size)})</span>
                  </div>
                  <div className="finalize-item">
                    <span className="finalize-lbl">Embedding Intensity Profile</span>
                    <span className="finalize-val" style={{ textTransform: "capitalize" }}>{embeddingType} Quality</span>
                  </div>
                </div>

                <button
                  className="btn-submit"
                  type="submit"
                  disabled={isSubmitting || (job && (job.status === "queued" || job.status === "running"))}
                >
                  {isSubmitting ? "Queueing..." : "Queue Cryptographic Encoding"}
                </button>
              </div>
            )}

            <div className="stepper-actions-row">
              {!job && (
                <button
                  type="button"
                  className="btn-stepper-back"
                  onClick={() => setEncodingStep(3)}
                >
                  Back
                </button>
              )}
            </div>
          </div>
        )}
      </form>

      {error ? (
        <div className="notification-card error">
          <div>❌</div>
          <div>{error}</div>
        </div>
      ) : null}
    </section>
  );
}
