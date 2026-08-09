import React from "react";
import { SvgIcons } from "./SvgIcons";

export function LandingView({ currentUser, onNavigate, onOpenDocs, onOpenPricing }) {
  return (
    <div className="landing-page-container">
      {/* SteganOS Header */}
      <header className="landing-header">
        <div className="landing-header-logo" onClick={() => onNavigate("landing")}>
          <img src="/logo.png" alt="StegoVault Logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
          <span>StegoVault</span>
        </div>
        <nav className="landing-header-nav">
          <a href="#platform" onClick={(e) => { e.preventDefault(); onNavigate(currentUser ? "dashboard" : "login"); }}>Platform</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }}>Features</a>
          <a href="#docs" onClick={(e) => { e.preventDefault(); onOpenDocs(); }}>Documentation</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); onOpenPricing(); }}>Pricing</a>
        </nav>
        <div className="landing-header-actions">
          {currentUser ? (
            <button className="btn-get-started" onClick={() => onNavigate("dashboard")}>
              Go to Dashboard
            </button>
          ) : (
            <>
              <button className="btn-nav-login" onClick={() => onNavigate("login")}>
                Login
              </button>
              <button className="btn-get-started" onClick={() => onNavigate("register")}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero-new">
        <div className="hero-left">
          <div className="engine-badge">
            <span className="badge-dot-green"></span> LUMINOUS SENTINEL ENGINE V2.4
          </div>
          <h1>Secure Your Secrets in <span className="blue-span">Plain Sight.</span></h1>
          <p>
            Deploy advanced neural steganography to camouflage sensitive data. Our GAN-based shielding ensures your assets remain invisible to traditional forensic tools and deep-packet inspection.
          </p>
          <div className="hero-buttons">
            <button className="btn-enter-dashboard" onClick={() => onNavigate(currentUser ? "dashboard" : "login")}>
              Enter Dashboard <SvgIcons.ArrowRight />
            </button>
            <button className="btn-learn-more" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              Learn how it works
            </button>
          </div>
          <div className="trusted-by">
            <span>TRUSTED BY TEAMS AT:</span>
            <span className="company-logo">CYBERCO</span>
            <span className="company-logo">SHIELDAI</span>
            <span className="company-logo">NODE_X</span>
          </div>
        </div>
        <div className="hero-right">
          <div className="glowing-card">
            <img src="/hero_face.png" alt="StegoVault AI Neural Camouflage Visual" className="hero-img" />
            
            <div className="status-overlay-top">
              <span className="status-dot"></span>
              <div className="status-text">
                <div className="status-title">GAN STATUS: OPTIMAL</div>
                <div className="status-subtitle">ENCODING LATENCY: 22MS</div>
              </div>
            </div>
            
            <div className="status-overlay-bottom">
              <div className="encryption-icon">
                <SvgIcons.Shield size={16} />
              </div>
              <div className="encryption-details">
                <div className="encryption-title">ENCRYPTION ACTIVE</div>
                <div className="encryption-progress-bar">
                  <div className="encryption-progress-fill" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next-Gen Shielding Section */}
      <section id="features" className="features-section">
        <h2>Next-Gen Shielding</h2>
        <p className="features-subtitle">Our proprietary architecture combines cryptographic strength with biological camouflage logic.</p>
        <div className="features-grid-new">
          <div className="feature-card-new">
            <div className="feature-icon-wrapper-new">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="8.5" x2="22" y2="15.5" />
                <line x1="2" y1="15.5" x2="22" y2="8.5" />
              </svg>
            </div>
            <h3>Neural Encoding</h3>
            <p>Hide data within images, video, and audio using GAN-based shielding. Our algorithms mutate pixel metadata without affecting visual fidelity.</p>
            <a href="#architecture" onClick={(e) => { e.preventDefault(); alert("Viewing Neural Architecture specifications..."); }} className="feature-link">VIEW ARCHITECTURE ↗</a>
          </div>
          
          <div className="feature-card-new">
            <div className="feature-icon-wrapper-new">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <h3>Extraction Engine</h3>
            <p>Rapidly isolate hidden payloads with 99.9% detection accuracy. Integrated entropy analysis ensures no fragment is left unrecovered.</p>
            <a href="#metrics" onClick={(e) => { e.preventDefault(); alert("Opening real-time extraction telemetry metrics..."); }} className="feature-link">PERFORMANCE METRICS ↗</a>
          </div>
          
          <div className="feature-card-new">
            <div className="feature-icon-wrapper-new">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </div>
            <h3>Secure Vault</h3>
            <p>Fragmented, AES-256 encrypted storage for your hidden assets. Even if one node is compromised, the payload remains mathematically incoherent.</p>
            <a href="#protocol" onClick={(e) => { e.preventDefault(); alert("Accessing secure cryptographic protocols..."); }} className="feature-link">SECURITY PROTOCOL ↗</a>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="cta-banner-new">
        <div className="cta-left">
          <h2>Ready to secure your communication?</h2>
          <div className="cta-links">
            <a href="#docs" onClick={(e) => { e.preventDefault(); alert("Opening API documentation..."); }} className="cta-link-item">
              📄 Read API Docs
            </a>
            <a href="#compliance" onClick={(e) => { e.preventDefault(); alert("System complies with standard AES-256 and FIPS guidelines."); }} className="cta-link-item">
              💼 Compliance Standards
            </a>
          </div>
        </div>
        <div className="cta-right">
          <button className="btn-create-account" onClick={() => onNavigate(currentUser ? "dashboard" : "register")}>
            Create Free Account
          </button>
          <span className="cta-subtext">NO CREDIT CARD REQUIRED. START IN SECONDS.</span>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="landing-footer-new">
        <div className="footer-brand-section">
          <div className="footer-logo">
            <img src="/logo.png" alt="StegoVault Logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
            <span>StegoVault</span>
          </div>
          <p className="footer-desc">
            Building the invisible future of data security. Clinical precision, neural-grade protection.
          </p>
          <p className="footer-copy">
            © 2026 StegoVault Security Labs. All rights reserved.
          </p>
        </div>
        <div className="footer-links-grid">
          <div className="footer-column">
            <h4>COMPANY</h4>
            <a href="#about" onClick={(e) => { e.preventDefault(); alert("StegoVault Security Labs: Pioneers in modern neural shielding."); }}>About</a>
            <a href="#careers" onClick={(e) => { e.preventDefault(); alert("No current openings. Check back soon!"); }}>Careers</a>
            <a href="#blog" onClick={(e) => { e.preventDefault(); alert("Read our security articles on medium."); }}>Blog</a>
          </div>
          <div className="footer-column">
            <h4>LEGAL</h4>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Your data is handled locally. Review policy in system config."); }}>Privacy Policy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Term of service: Operational use is fully private."); }}>Terms of Service</a>
            <a href="#disclosure" onClick={(e) => { e.preventDefault(); alert("Responsible disclosure: security@stegovault.io"); }}>Security Disclosure</a>
          </div>
          <div className="footer-column">
            <h4>SUPPORT</h4>
            <a href="#docs" onClick={(e) => { e.preventDefault(); onNavigate(currentUser ? "dashboard" : "login"); }}>Documentation</a>
            <a href="#help" onClick={(e) => { e.preventDefault(); alert("Operational support available on-demand in system settings."); }}>Help Center</a>
            <a href="#status" onClick={(e) => { e.preventDefault(); alert("All clusters operational. Node count: 24/24."); }}>Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
