import React from "react";

export function TechBlueprint({ modality, activeTab }) {
  const blueprints = {
    image: {
      model: "Two-Stage Depth-Balanced GAN",
      pipeline: "Adversarial Generator / Critic Image Layering",
      loss: "PSNR (> 74 dB) + Steganalysis Evasion Loss",
      crypto: "AES-256-GCM + SHA-256 Key-Bound Signature"
    },
    audio: {
      model: "DWT + Swin Transformer",
      pipeline: "Discrete Wavelet Transform + Swin Block Sequence",
      loss: "Optimal Time-Frequency Localization Loss",
      crypto: "AES-256-GCM + Echo Carrier Signatures"
    },
    video: {
      model: "Multiscale Attention CNN",
      pipeline: "Multiscale Spatio-Temporal Attention Engine",
      loss: "SSIM (0.9999) + Temporal Consistency Loss",
      crypto: "AES-256-GCM + Spatio-Temporal Frame Hashes"
    },
    text: {
      model: "Auto-Stega (LLM-based)",
      pipeline: "Dynamic Token Selection LLM Adapter",
      loss: "Contextual Perplexity-Preserving Loss",
      crypto: "AES-256-GCM + Token-Signature Key Integrity Seal"
    }
  };

  const current = blueprints[modality] || blueprints.image;

  return (
    <section className={`glass-panel tech-blueprint-card ${activeTab === "decrypt" ? "decrypt-mode" : ""}`}>
      <span className="section-kicker">modality_technology_blueprint</span>
      <h3 style={{ textTransform: "uppercase", fontSize: "1.1rem", marginBottom: 16 }}>
        Active Neural Tech Stack
      </h3>
      <div className="blueprint-list">
        <div className="blueprint-row">
          <span className="bp-label">Architecture</span>
          <span className="bp-value">{current.model}</span>
        </div>
        <div className="blueprint-row">
          <span className="bp-label">Pipeline Engine</span>
          <span className="bp-value">{current.pipeline}</span>
        </div>
        <div className="blueprint-row">
          <span className="bp-label">Objective metrics</span>
          <span className="bp-value">{current.loss}</span>
        </div>
        <div className="blueprint-row">
          <span className="bp-label">Cryptographic Seal</span>
          <span className="bp-value">{current.crypto}</span>
        </div>
      </div>
    </section>
  );
}
