import React, { useEffect, useState } from "react";
import {
  clone_tailored_resume,
  get_tailored_resume,
  update_tailored_resume,
} from "./api/api";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function TailoredResumeEditor({ job, onBack }) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Loading...");
  const [isBusy, setIsBusy] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    if (!job?.id) return;
    const load = async () => {
      setIsBusy(true);
      setStatus("Loading...");
      try {
        const res = await get_tailored_resume(job.id);
        setContent(res.data.content || "");
        setStatus(res.data.exists ? "Loaded" : "New resume");
      } catch (error) {
        console.error(error);
        setStatus("Failed to load");
      } finally {
        setIsBusy(false);
      }
    };
    load();
  }, [job?.id]);

  const handleSave = async () => {
    if (!job?.id) return;
    setIsBusy(true);
    setStatus("Saving...");
    try {
      await update_tailored_resume(job.id, content);
      setStatus("Saved");
      setLoadingPreview(true);
      setPreviewError("");
      setPreviewCount((c) => c + 1);
    } catch (error) {
      console.error(error);
      setStatus("Save failed");
    } finally {
      setIsBusy(false);
    }
  };

  const handleClone = async () => {
    if (!job?.id) return;
    setIsBusy(true);
    setStatus("Cloning...");
    try {
      const res = await clone_tailored_resume(job.id);
      setContent(res.data.content || "");
      setStatus("Cloned from master");
      setLoadingPreview(true);
      setPreviewError("");
      setPreviewCount((c) => c + 1);
    } catch (error) {
      console.error(error);
      setStatus("Clone failed");
    } finally {
      setIsBusy(false);
    }
  };

  if (!job) {
    return (
      <div className="empty">
        <h3>Select an application</h3>
        <p className="muted">Pick a job to edit its tailored resume.</p>
        <button className="ghost" onClick={onBack}>Back to list</button>
      </div>
    );
  }

  return (
    <div className="resumePage">
      <div className="resumeHeader">
        <div>
          <h2>Tailored Resume</h2>
          <p className="muted">{job.company} — {job.position}</p>
          <p className="muted">Status: {status}</p>
        </div>
        <div className="actions">
          <button className="ghost" onClick={onBack}>Back</button>
          <button className="ghost" onClick={handleClone} disabled={isBusy}>
            Use Master Resume
          </button>
          <button className="primary" onClick={handleSave} disabled={isBusy}>
            Save & Preview
          </button>
        </div>
      </div>

      <div className="resumeGrid">
        <div className="resumeEditor">
          <h3>LaTeX Editor</h3>
          <textarea
            className="resumeTextarea"
            rows={22}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit tailored resume LaTeX here..."
          />
        </div>
        <div className="resumePreview">
          <h3>Preview</h3>
          <div className="resumePreviewBox">
            {loadingPreview && (
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
                src={`${backend}/api/tailored/${job.id}/preview/?ts=${previewCount}`}
                alt="Resume preview"
                onLoad={() => setLoadingPreview(false)}
                onError={() => {
                  setLoadingPreview(false);
                  setPreviewError("Preview unavailable. Ensure pdflatex and ImageMagick are installed.");
                }}
              />
            )}
          </div>
          <p className="muted">Preview refreshes after save.</p>
        </div>
      </div>
    </div>
  );
}

