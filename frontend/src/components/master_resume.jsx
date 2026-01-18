import React, { useEffect, useState } from "react";
import { get_master_resume, update_master_resume } from "./api/api";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const MasterResume = ({ onBack }) => {
  const [masterResume, setMasterResume] = useState("");
  const [saveCount, setSaveCount] = useState(0);
  const [loadingImage, setLoadingImage] = useState(true);
  const [previewError, setPreviewError] = useState("");
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    const fetchMaster = async () => {
      const res = await get_master_resume();
      if (res.status === 200) {
        setMasterResume(res.data.content);
        setStatus("Loaded");
      } else {
        setStatus("Failed to load");
      }
    };
    fetchMaster();
  }, [saveCount]);

  const saveResume = async () => {
    const res = await update_master_resume(masterResume);
    if (res && res.status === 200) {
      setLoadingImage(true);
      setPreviewError("");
      setStatus("Saved");
      setSaveCount((c) => c + 1);
    } else {
      setStatus("Save failed");
    }
  };

  return (
    <div className="resumePage">
      <div className="resumeHeader">
        <div>
          <h2>Master Resume</h2>
          <p className="muted">Used as the base for new applications.</p>
          <p className="muted">Status: {status}</p>
        </div>
        <div className="actions">
          {onBack && <button className="ghost" onClick={onBack}>Back</button>}
          <button className="primary" onClick={saveResume}>Save Master Resume</button>
        </div>
      </div>

      <div className="resumeGrid">
        <div className="resumeEditor">
          <h3>LaTeX Editor</h3>
          <textarea
            className="resumeTextarea"
            value={masterResume}
            onChange={(e) => setMasterResume(e.target.value)}
            rows={22}
          />
        </div>
        <div className="resumePreview">
          <h3>Preview</h3>
          <div className="resumePreviewBox">
            {loadingImage && (
              <div className="resumePreviewLoading">
                <div className="spinner" />
              </div>
            )}
            {previewError ? (
              <div className="resumePreviewError">
                {previewError}
              </div>
            ) : (
              <img
                src={`${backend}/api/get_master_preview?ts=${saveCount}`}
                className={loadingImage ? "isDimmed" : ""}
                onLoad={() => setLoadingImage(false)}
                onError={() => {
                  setLoadingImage(false);
                  setPreviewError("Preview unavailable. Ensure pdflatex and ImageMagick are installed.");
                }}
                alt="Resume preview"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterResume;
