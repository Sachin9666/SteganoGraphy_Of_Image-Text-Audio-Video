import React, { useRef, useState } from "react";
import { SvgIcons } from "./SvgIcons";
import { formatBytes } from "../utils/helpers";

export function FileDropzone({ label, accept, file, previewUrl, textSnippet, onFileChange, helper, modality, type }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="form-group">
      <span className="dropzone-label">{label}</span>
      <div
        className={`dropzone-container ${dragActive ? "dragover" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden-input"
          style={{ display: "none" }}
          accept={accept}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileChange(e.target.files[0]);
            }
          }}
        />

        {file ? (
          <div className="preview-wrapper" onClick={(e) => e.stopPropagation()}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="image-preview-frame" />
            ) : textSnippet ? (
              <div className="text-preview-box">{textSnippet}</div>
            ) : null}
            <div className="file-info-badge">
              {file.name} ({formatBytes(file.size)})
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: "4px 10px", fontSize: "0.75rem", minHeight: "auto", borderRadius: "6px" }}
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
            >
              Remove file
            </button>
          </div>
        ) : (
          <>
            <div className="dropzone-icon">
              <SvgIcons.Upload />
            </div>
            <p className="dropzone-prompt">
              Drag and drop or <span>browse</span>
            </p>
            <p className="dropzone-limit">{helper}</p>
          </>
        )}
      </div>
    </div>
  );
}
