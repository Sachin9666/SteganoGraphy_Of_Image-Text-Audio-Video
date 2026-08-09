import React, { useState } from "react";
import { SvgIcons } from "./SvgIcons";
import { formatBytes } from "../utils/helpers";

export function VaultView({ myJobs = [], onNavigate, onVaultDecrypt, showToast }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [selectedModality, setSelectedModality] = useState("all");
  const [selectedFile, setSelectedFile] = useState(null);



  // Filter completed jobs for the vault (only success jobs are vaulted)
  const completedJobs = myJobs.filter(job => job.status === "completed");

  // Map database jobs to files list format
  const realFiles = completedJobs.map(job => {
    let dateStr = "N/A";
    try {
      if (job.updated_at) {
        dateStr = new Date(job.updated_at + "Z").toISOString().split("T")[0];
      }
    } catch (e) {
      dateStr = job.updated_at?.split("T")[0] || "N/A";
    }

    // Set encryption tags
    let encryption = "AES-256-GCM";
    let encryptionClass = "aes-gcm";
    if (job.job_type === "decode") {
      encryption = "DECRYPTED";
      encryptionClass = "decrypted";
    } else {
      if (job.modality === "video") {
        encryption = "ECC + SPECTRAL";
        encryptionClass = "ecc-spectral";
      } else if (job.modality === "text") {
        encryption = "AES-256";
        encryptionClass = "aes-256";
      }
    }

    // Dynamic size mapped from backend query
    const size = formatBytes(job.output_size);

    let payload = job.access_key ? `Payload Access Key: ${job.access_key}` : "No Access Key Required";
    if (job.job_type === "decode") {
      payload = `Extracted secret payload (Key: ${job.access_key || "None"})`;
    }

    return {
      id: job.job_id,
      name: job.output_name || `${job.modality.toUpperCase()}_SEAL_${job.job_id.slice(0, 8)}`,
      payload: payload,
      size: size,
      date: dateStr,
      encryption: encryption,
      encryptionClass: encryptionClass,
      rawJob: job
    };
  });

  const handleDecrypt = (file) => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    setLogs(prev => [
      ...prev,
      `[${timestamp}] DECRYPTING ASSET [${file.name}] USING KEY PROTOCOL [${file.encryption}]...`,
      `[${timestamp}] REDIRECTING PORT TO DE-STEGANOGRAPHY PIPELINE.`
    ]);
    setTimeout(() => {
      onVaultDecrypt(file.rawJob);
    }, 600);
  };

  const handleDownload = async (file) => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    setLogs(prev => [
      ...prev,
      `[${timestamp}] ACCESSING VAULT BUFFER INDEX FOR [${file.name}]...`,
      `[${timestamp}] REQUESTING DECRYPTED FILE ARTIFACT BINARY FROM SECURE CLUSTER...`
    ]);

    try {
      const { downloadArtifact } = await import("../api");
      const { blob, filename } = await downloadArtifact(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setLogs(prev => [
        ...prev,
        `[${timestamp}] DOWNLOAD COMPLETED SUCCESSFUL (FILE: ${filename}).`
      ]);
    } catch (err) {
      setLogs(prev => [
        ...prev,
        `[${timestamp}] ERROR RESOLVING ARTIFACT BINARY: ${err.message}`
      ]);
    }
  };

  // Filter logic on real database files
  const filteredFiles = realFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          file.payload.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEncryption = filterType === "all" || file.encryptionClass === filterType;
    const matchesModality = selectedModality === "all" || file.rawJob.modality === selectedModality;

    return matchesSearch && matchesEncryption && matchesModality;
  });

  // Dynamic modality counts
  const imageCount = completedJobs.filter(j => j.modality === "image").length;
  const videoCount = completedJobs.filter(j => j.modality === "video").length;
  const audioCount = completedJobs.filter(j => j.modality === "audio").length;
  const documentCount = completedJobs.filter(j => j.modality === "text").length;

  const totalCount = imageCount + audioCount + videoCount + documentCount;
  const imagePercent = totalCount > 0 ? `${((imageCount / totalCount) * 100).toFixed(0)}%` : "0%";
  const audioPercent = totalCount > 0 ? `${((audioCount / totalCount) * 100).toFixed(0)}%` : "0%";
  const videoPercent = totalCount > 0 ? `${((videoCount / totalCount) * 100).toFixed(0)}%` : "0%";
  const documentPercent = totalCount > 0 ? `${((documentCount / totalCount) * 100).toFixed(0)}%` : "0%";

  return (
    <div className="vault-full-view">
      <div>
        <span className="section-kicker">encrypted_vault_telemetry</span>
        <h1 className="panel-title">Secure Vault Manager</h1>
        <p className="panel-subtitle">
          Manage cryptographically sealed assets and key authorizations. All assets are double-encrypted with local AES-256-GCM configurations.
        </p>
      </div>

      {/* Header actions toolbar */}
      <div className="vault-header-actions">
        <div className="input-glow-wrapper" style={{ flex: 1, maxWidth: "400px" }}>
          <input 
            type="text" 
            className="cyber-input" 
            placeholder="Search vault..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
          <span style={{ position: "absolute", left: "14px", display: "flex", alignItems: "center", color: "var(--text-muted)" }}>
            <SvgIcons.Search />
          </span>
        </div>
        <button className="btn-filter" onClick={() => setShowFilters(!showFilters)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filter {filterType !== "all" && `(${filterType.toUpperCase()})`}
        </button>
      </div>

      {/* Interactive filter options row */}
      {showFilters && (
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          background: "rgba(0, 0, 0, 0.02)",
          padding: "10px 16px",
          borderRadius: "10px",
          border: "1px solid var(--border-dim)",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginRight: "10px" }}>Filter Encryption:</span>
          {["all", "aes-gcm", "ecc-spectral", "aes-256"].map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={`tab-btn ${filterType === type ? "active" : ""}`}
              style={{ padding: "6px 12px", fontSize: "0.78rem", minHeight: "auto" }}
            >
              {type === "all" ? "All" : type.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Summary modality statistics cards */}
      <div className="vault-modality-row">
        <div 
          className={`vault-modality-card images ${selectedModality === "image" ? "active" : ""}`}
          onClick={() => setSelectedModality(selectedModality === "image" ? "all" : "image")}
          style={{ cursor: "pointer" }}
        >
          <div className="vault-modality-card-header">
            <div className="vault-modality-card-avatar">
              <SvgIcons.Image />
            </div>
            <span className="vault-modality-card-count">{imageCount} file{imageCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="vault-modality-card-title">Images</div>
          <div className="vault-modality-card-desc">
            Visual steganographic layers utilizing LSB encoding techniques across PNG/WebP cover carriers.
          </div>
          <div className="vault-modality-card-progress">
            <div className="vault-modality-card-progress-fill" style={{ width: imagePercent }}></div>
          </div>
        </div>

        <div 
          className={`vault-modality-card audios ${selectedModality === "audio" ? "active" : ""}`}
          onClick={() => setSelectedModality(selectedModality === "audio" ? "all" : "audio")}
          style={{ cursor: "pointer" }}
        >
          <div className="vault-modality-card-header">
            <div className="vault-modality-card-avatar">
              <SvgIcons.Audio />
            </div>
            <span className="vault-modality-card-count">{audioCount} file{audioCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="vault-modality-card-title">Audio</div>
          <div className="vault-modality-card-desc">
            Imperceptible frequency modulation and echo hiding techniques in WAV/FLAC containers.
          </div>
          <div className="vault-modality-card-progress">
            <div className="vault-modality-card-progress-fill" style={{ width: audioPercent }}></div>
          </div>
        </div>

        <div 
          className={`vault-modality-card videos ${selectedModality === "video" ? "active" : ""}`}
          onClick={() => setSelectedModality(selectedModality === "video" ? "all" : "video")}
          style={{ cursor: "pointer" }}
        >
          <div className="vault-modality-card-header">
            <div className="vault-modality-card-avatar">
              <SvgIcons.Video />
            </div>
            <span className="vault-modality-card-count">{videoCount} file{videoCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="vault-modality-card-title">Videos</div>
          <div className="vault-modality-card-desc">
            Spectral audio-visual frequency modulation stego records mapped over MP4 media structures.
          </div>
          <div className="vault-modality-card-progress">
            <div className="vault-modality-card-progress-fill" style={{ width: videoPercent }}></div>
          </div>
        </div>

        <div 
          className={`vault-modality-card documents ${selectedModality === "text" ? "active" : ""}`}
          onClick={() => setSelectedModality(selectedModality === "text" ? "all" : "text")}
          style={{ cursor: "pointer" }}
        >
          <div className="vault-modality-card-header">
            <div className="vault-modality-card-avatar">
              <SvgIcons.Text />
            </div>
            <span className="vault-modality-card-count">{documentCount} file{documentCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="vault-modality-card-title">Documents</div>
          <div className="vault-modality-card-desc">
            AES-256 cryptographically sharded text payloads embedded within benign looking PDF/TXT files.
          </div>
          <div className="vault-modality-card-progress">
            <div className="vault-modality-card-progress-fill" style={{ width: documentPercent }}></div>
          </div>
        </div>
      </div>

      {/* Upgraded files table */}
      <div className="vault-files-table-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Sealed Asset List</h3>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Displaying {filteredFiles.length} item{filteredFiles.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="ops-table-wrapper">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Date Modified</th>
                <th>Encryption</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{file.name}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {file.payload}
                        </span>
                      </div>
                    </td>
                    <td className="font-mono">{file.size}</td>
                    <td>{file.date}</td>
                    <td>
                      <span className={`encryption-badge ${file.encryptionClass}`}>
                        {file.encryption}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button 
                          className="btn-view-report" 
                          onClick={() => setSelectedFile(file)}
                          style={{ fontSize: "0.8rem", padding: 0, color: "#2563eb" }}
                        >
                          Details
                        </button>
                        <span style={{ color: "var(--border-dim)" }}>|</span>
                        {file.rawJob.job_type === "encode" && (
                          <>
                            <button 
                              className="btn-view-report" 
                              onClick={() => handleDecrypt(file)}
                              style={{ fontSize: "0.8rem", padding: 0 }}
                            >
                              Decrypt
                            </button>
                            <span style={{ color: "var(--border-dim)" }}>|</span>
                          </>
                        )}
                        <button 
                          className="btn-view-report" 
                          onClick={() => handleDownload(file)}
                          style={{ fontSize: "0.8rem", padding: 0, color: "var(--accent-green)" }}
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: "30px 10px", color: "var(--text-muted)", textAlign: "center" }}>
                    No sealed assets found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination */}
        <div className="table-footer-row">
          <div className="table-footer-info">
            Showing 1 to {filteredFiles.length} of {filteredFiles.length} entries
          </div>
          <div className="pagination-container">
            <button className="btn-pagination" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className="btn-pagination" style={{ background: "var(--accent-cyan)", color: "#ffffff", borderColor: "var(--accent-cyan)" }}>1</button>
            <button className="btn-pagination" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>


      {/* Telemetry Details Modal Overlay */}
      {selectedFile && (
        <div className="modal-overlay" onClick={() => setSelectedFile(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedFile(null)}>
              &times;
            </button>

            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
              <div className="vault-icon-container" style={{ 
                background: "rgba(37, 99, 235, 0.1)", 
                color: "#2563eb",
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {selectedFile.rawJob.modality === "image" ? <SvgIcons.Image size={24} /> :
                 selectedFile.rawJob.modality === "audio" ? <SvgIcons.Audio size={24} /> :
                 selectedFile.rawJob.modality === "video" ? <SvgIcons.Video size={24} /> :
                 <SvgIcons.Text size={24} />}
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Asset Telemetry</h3>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>SHA-256 bound stego transaction</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Operation Type</span>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {selectedFile.rawJob.job_type === "encode" ? "Secure Encoding (Embedding)" : "Secure Decoding (Extraction)"}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Modality</span>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem", textTransform: "capitalize" }}>
                    {selectedFile.rawJob.modality} Carrier
                  </span>
                </div>
              </div>

              <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Filename</span>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem", wordBreak: "break-all" }}>
                    {selectedFile.name}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>File Size</span>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {selectedFile.size}
                  </span>
                </div>
              </div>

              <div className="detail-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Date Created</span>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {selectedFile.date}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Device Processor</span>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {selectedFile.rawJob.device_info?.device?.toUpperCase() ?? "CPU"} (Auto-Scaled)
                  </span>
                </div>
              </div>

              {selectedFile.rawJob.access_key && (
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Secret Access Key</span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "#2563eb", fontWeight: 700 }}>
                      {selectedFile.rawJob.access_key}
                    </code>
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedFile.rawJob.access_key);
                        showToast("Access Key copied to clipboard!", "success");
                      }} 
                      style={{
                        background: "#eff6ff",
                        border: "none",
                        color: "#2563eb",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      Copy Key
                    </button>
                  </div>
                </div>
              )}

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Payload Data</span>
                <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                  {selectedFile.payload}
                </span>
                <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                  {selectedFile.rawJob.job_type === "encode" && (
                    <button 
                      onClick={() => {
                        setSelectedFile(null);
                        handleDecrypt(selectedFile);
                      }} 
                      style={{
                        background: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      Decrypt Carrier
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      handleDownload(selectedFile);
                    }} 
                    style={{
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    Download File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

