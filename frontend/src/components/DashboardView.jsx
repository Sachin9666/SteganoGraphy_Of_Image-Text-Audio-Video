import React, { useState } from "react";
import { SvgIcons } from "./SvgIcons";

export function DashboardView({ serverHealth, recentActivity, myJobs = [], metrics, onNavigate, clearActivity }) {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const defaultOperations = [
    { id: "STG-88219", type: "encode", name: "NDA_Contract_v2.pdf", status: "completed", timestamp: "12:14:02 PM", modality: "image" },
    { id: "STG-88214", type: "decode", name: "Encrypted_Asset_001.png", status: "completed", timestamp: "11:58:34 AM", modality: "image" },
    { id: "STG-88198", type: "encode", name: "Strategic_Plan.docx", status: "processing", timestamp: "11:45:10 AM", modality: "text" },
    { id: "STG-88185", type: "decode", name: "Unknown_Header.bin", status: "failed", timestamp: "11:30:15 AM", modality: "video" }
  ];

  const displayOps = myJobs.length > 0
    ? myJobs.map(job => {
        let timeStr = "";
        try {
          if (job.updated_at) {
            const date = new Date(job.updated_at + "Z");
            timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
          }
        } catch (e) {
          timeStr = job.updated_at || "";
        }
        return {
          id: job.job_id,
          type: job.job_type,
          name: job.metadata?.input_name || job.output_name || "Unknown Asset",
          status: job.status,
          timestamp: timeStr,
          modality: job.modality
        };
      })
    : recentActivity.length > 0 
      ? recentActivity.map(act => ({
          id: act.id,
          type: act.type,
          name: act.name,
          status: act.status,
          timestamp: act.timestamp,
          modality: act.modality
        }))
      : defaultOperations;

  return (
    <div className="dashboard-grid">
      <div className="dashboard-left">
        {/* AI Engine Health */}
        <div className="engine-health-card">
          <div className="health-header-row">
            <div>
              <span className="section-kicker">engine_telemetry</span>
              <h2 className="panel-title" style={{ fontSize: "1.4rem", marginBottom: 4 }}>AI Engine Health</h2>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                Active Processor: {metrics?.device ?? "CPU"} (Auto-Scaled)
              </span>
            </div>
            <span className="health-status-badge">
              <span style={{ 
                display: "inline-block", 
                width: 8, 
                height: 8, 
                borderRadius: "50%", 
                backgroundColor: serverHealth.online ? "#16a34a" : "#dc2626", 
                marginRight: 6 
              }}></span>
              {serverHealth.online ? "OPERATIONAL" : "OFFLINE"}
            </span>
          </div>

          <div className="health-metrics-row">
            <div className="health-metric-item">
              <span className="health-metric-lbl">Latency</span>
              <span className="health-metric-val">{metrics?.latency ?? "15ms"}</span>
            </div>
            <div className="health-metric-item">
              <span className="health-metric-lbl">Throughput</span>
              <span className="health-metric-val">{metrics?.throughput ?? "2.4 GB/s"}</span>
            </div>
            <div className="health-metric-item">
              <span className="health-metric-lbl">Uptime</span>
              <span className="health-metric-val">{metrics?.uptime ?? "99.98%"}</span>
            </div>
          </div>

          <div className="health-bg-shield">
            <SvgIcons.Shield size={140} />
          </div>
        </div>

        {/* Recent Operations */}
        <div className="recent-ops-card">
          <div className="card-title-row">
            <div>
              <span className="section-kicker">audit_log</span>
              <h2 className="panel-title" style={{ fontSize: "1.2rem", marginBottom: 0 }}>Recent Operations</h2>
            </div>
            <a href="#history" className="link-history" onClick={(e) => { e.preventDefault(); setShowHistoryModal(true); }}>
              View History <SvgIcons.ArrowRight />
            </a>
          </div>

          <div className="ops-table-wrapper">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Operation ID</th>
                  <th>Type</th>
                  <th>Source File</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayOps.slice(0, 4).map((op) => (
                  <tr key={op.id}>
                    <td>
                      <span className="ops-id-link">#{op.id.slice(0, 10)}</span>
                    </td>
                    <td>
                      <div className="ops-type-cell">
                        {op.type === "encode" ? <SvgIcons.Lock /> : <SvgIcons.Key />}
                        <span>{op.type === "encode" ? "Encoding" : "Decoding"}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {op.name}
                    </td>
                    <td>
                      <span className={`status-pill ${op.status}`}>
                        {op.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stego Engine Modality Diagnostics */}
        <div className="recent-ops-card" style={{ marginTop: 0 }}>
          <div className="card-title-row" style={{ marginBottom: "12px" }}>
            <div>
              <span className="section-kicker">model_telemetry</span>
              <h2 className="panel-title" style={{ fontSize: "1.2rem", marginBottom: 0 }}>Stego Engine Modalities</h2>
            </div>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "20px" }}>
            Active neural network configuration mapping, validation limits, and simulated detection bypass ratings.
          </p>

          <div className="ops-table-wrapper">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Modality</th>
                  <th>Active Neural Model</th>
                  <th>Limit</th>
                  <th>Security Bypass</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                    <SvgIcons.Image size={16} /> Image
                  </td>
                  <td className="font-mono" style={{ fontSize: "0.8rem" }}>Two-Stage Depth-Balanced GAN</td>
                  <td className="font-mono" style={{ fontSize: "0.8rem" }}>100 MB</td>
                  <td>
                    <span className="status-pill completed" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>99.4% Safe</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                    <SvgIcons.Audio size={16} /> Audio
                  </td>
                  <td className="font-mono" style={{ fontSize: "0.8rem" }}>DWT + Swin Transformer</td>
                  <td className="font-mono" style={{ fontSize: "0.8rem" }}>100 MB</td>
                  <td>
                    <span className="status-pill completed" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>98.7% Safe</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                    <SvgIcons.Video size={16} /> Video
                  </td>
                  <td className="font-mono" style={{ fontSize: "0.8rem" }}>Multiscale Attention CNN</td>
                  <td className="font-mono" style={{ fontSize: "0.8rem" }}>100 MB</td>
                  <td>
                    <span className="status-pill processing" style={{ fontSize: "0.75rem", padding: "2px 8px", background: "#e0f2fe", color: "#0369a1" }}>97.2% Safe</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                    <SvgIcons.Text size={16} /> Text
                  </td>
                  <td className="font-mono" style={{ fontSize: "0.8rem" }}>Auto-Stega (LLM-based)</td>
                  <td className="font-mono" style={{ fontSize: "0.8rem" }}>100 MB</td>
                  <td>
                    <span className="status-pill completed" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>99.1% Safe</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="dashboard-right">
        <div className="shortcut-cards-col">
          <div className="shortcut-card encode" onClick={() => onNavigate("encoding")}>
            <div className="shortcut-info">
              <span className="health-metric-lbl" style={{ color: "rgba(255, 255, 255, 0.7)" }}>Operation Shortcut</span>
              <span className="shortcut-title">New Encoding</span>
            </div>
            <SvgIcons.ArrowRight />
          </div>

          <div className="shortcut-card decode" onClick={() => onNavigate("decoding")}>
            <div className="shortcut-info">
              <span className="health-metric-lbl" style={{ color: "rgba(255, 255, 255, 0.7)" }}>Operation Shortcut</span>
              <span className="shortcut-title">New Decoding</span>
            </div>
            <SvgIcons.ArrowRight />
          </div>
        </div>

        {/* Neural Modalities Hub */}
        <div className="vault-card" style={{ marginTop: 0 }}>
          <div className="vault-header">
            <div className="vault-icon-container" style={{ background: "rgba(37, 99, 235, 0.1)", color: "#2563eb" }}>
              <SvgIcons.Grid />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Neural Modalities</h3>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Launch operations directly</span>
            </div>
          </div>

          <div className="modality-hub-list">
            <div className="modality-hub-item">
              <div className="modality-hub-label">
                <SvgIcons.Image size={18} />
                <span>Image Carrier</span>
              </div>
              <div className="modality-hub-actions">
                <button className="hub-btn encode" onClick={() => onNavigate("encoding", "image")}>Encode</button>
                <button className="hub-btn decode" onClick={() => onNavigate("decoding", "image")}>Decode</button>
              </div>
            </div>

            <div className="modality-hub-item">
              <div className="modality-hub-label">
                <SvgIcons.Audio size={18} />
                <span>Audio Carrier</span>
              </div>
              <div className="modality-hub-actions">
                <button className="hub-btn encode" onClick={() => onNavigate("encoding", "audio")}>Encode</button>
                <button className="hub-btn decode" onClick={() => onNavigate("decoding", "audio")}>Decode</button>
              </div>
            </div>

            <div className="modality-hub-item">
              <div className="modality-hub-label">
                <SvgIcons.Video size={18} />
                <span>Video Carrier</span>
              </div>
              <div className="modality-hub-actions">
                <button className="hub-btn encode" onClick={() => onNavigate("encoding", "video")}>Encode</button>
                <button className="hub-btn decode" onClick={() => onNavigate("decoding", "video")}>Decode</button>
              </div>
            </div>

            <div className="modality-hub-item">
              <div className="modality-hub-label">
                <SvgIcons.Text size={18} />
                <span>Text Carrier</span>
              </div>
              <div className="modality-hub-actions">
                <button className="hub-btn encode" onClick={() => onNavigate("encoding", "text")}>Encode</button>
                <button className="hub-btn decode" onClick={() => onNavigate("decoding", "text")}>Decode</button>
              </div>
            </div>
          </div>
        </div>

        <div className="vault-card">
          <div className="vault-header">
            <div className="vault-icon-container">
              <SvgIcons.Vault />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Secure Vault</h3>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Encrypted storage status</span>
            </div>
          </div>

          <div className="vault-capacity-row">
            <span style={{ fontWeight: 600 }}>Storage Capacity</span>
            <span className="vault-percentage">
              {metrics ? `${((metrics.storage_used / metrics.storage_total) * 100).toFixed(2)}%` : "0.00%"} Full
            </span>
          </div>

          <div className="vault-progress-track">
            <div className="vault-progress-fill" style={{ 
              width: metrics ? `${((metrics.storage_used / metrics.storage_total) * 100).toFixed(2)}%` : "0%" 
            }}></div>
          </div>

          <div className="vault-capacity-detail">
            {metrics ? (metrics.storage_used / (1024 * 1024)).toFixed(2) : "0.00"} MB Used // 500 GB Total
          </div>

          <div className="vault-grid-info">
            <div className="vault-info-item">
              <span className="vault-info-lbl">Files</span>
              <span className="vault-info-val">{metrics?.file_count ?? 0}</span>
            </div>
            <div className="vault-info-item">
              <span className="vault-info-lbl">Key Auth</span>
              <span className={`vault-info-val ${metrics?.key_auth === "ACTIVE" ? "active" : ""}`}>
                {metrics?.key_auth ?? "INACTIVE"}
              </span>
            </div>
          </div>

          <button className="btn-manage-vault" onClick={() => onNavigate("vault")}>
            Manage Vault Assets
          </button>
        </div>

        <div className="threat-card">
          <div className="threat-info">
            <span className="threat-lbl">Threat Level</span>
            <span className="threat-val">MINIMAL</span>
          </div>
          <div className="threat-icon-wrapper">
            <SvgIcons.ShieldCheck />
          </div>
        </div>
      </div>

      {/* Operations History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
            <button className="modal-close-btn" onClick={() => setShowHistoryModal(false)}>
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
                <SvgIcons.Activity size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Operations History</h3>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Audit logs of all steganography transactions</span>
              </div>
            </div>

            <div className="ops-table-wrapper" style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "20px" }}>
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Source File</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayOps.length > 0 ? (
                    displayOps.map((op) => (
                      <tr key={op.id}>
                        <td>
                          <span className="ops-id-link">#{op.id.slice(0, 10)}</span>
                        </td>
                        <td>
                          <div className="ops-type-cell">
                            {op.type === "encode" ? <SvgIcons.Lock size={14} /> : <SvgIcons.Key size={14} />}
                            <span style={{ fontSize: "0.82rem" }}>{op.type === "encode" ? "Encoding" : "Decoding"}</span>
                          </div>
                        </td>
                        <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                          {op.name}
                        </td>
                        <td style={{ fontSize: "0.82rem" }}>
                          {op.timestamp || "Recent"}
                        </td>
                        <td>
                          <span className={`status-pill ${op.status}`} style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                            {op.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                        No operations registered in local audit log.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              {displayOps.length > 0 && (
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear the entire operations history?")) {
                      clearActivity();
                      setShowHistoryModal(false);
                    }
                  }} 
                  style={{
                    background: "#fef2f2",
                    color: "#b91c1c",
                    border: "1px solid rgba(185, 28, 28, 0.15)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Clear History
                </button>
              )}
              <button 
                onClick={() => setShowHistoryModal(false)}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  marginLeft: "auto"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
