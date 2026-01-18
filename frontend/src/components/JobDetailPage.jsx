import React, { useEffect, useState } from "react";
import { clone_tailored_resume, get_tailored_resume } from "./api/api";

function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleDateString();
}

export default function JobDetailPage({
  job,
  statuses,
  onBack,
  onUpdate,
  onOpenResume,
}) {
  const [resumeMeta, setResumeMeta] = useState({ exists: false, updatedAt: null });
  const [isBusy, setIsBusy] = useState(false);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/d922bb2f-772d-476b-9c3a-9815e2d08fee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'JobDetailPage.jsx:17',message:'render',data:{jobId:job?.id,status:job?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

  useEffect(() => {
    if (!job?.id) return;
    const loadResume = async () => {
      try {
        const res = await get_tailored_resume(job.id);
        setResumeMeta({
          exists: !!res.data.exists,
          updatedAt: res.data.updated_at || res.data.updatedAt || null,
        });
      } catch (error) {
        console.error(error);
      }
    };
    loadResume();
  }, [job?.id]);

  const handleClone = async () => {
    if (!job?.id) return;
    setIsBusy(true);
    try {
      await clone_tailored_resume(job.id);
      const res = await get_tailored_resume(job.id);
      setResumeMeta({
        exists: !!res.data.exists,
        updatedAt: res.data.updated_at || res.data.updatedAt || null,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  };

  if (!job) {
    return (
      <div className="empty">
        <h3>No job selected</h3>
        <p className="muted">Please select a job from the list or kanban.</p>
      </div>
    );
  }

  return (
    <div className="jobPage">
      <div className="jobPageHeader">
        <button className="ghost" onClick={onBack}>← Back to Dashboard</button>
        <div className="jobTitle">
          <h1>{job.company} — {job.position}</h1>
          <p className="muted">Applied: {formatDate(job.dateApplied)}</p>
        </div>
      </div>

      <div className="jobMetaRow">
        <div className="jobMetaItem">
          <span>Status</span>
          <select
            value={job.status}
            onChange={(e) => onUpdate({ status: e.target.value })}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="jobMetaItem">
          <span>Follow-up</span>
          <input
            type="date"
            value={job.followUpDate || ""}
            onChange={(e) => onUpdate({ followUpDate: e.target.value })}
          />
        </div>
        <div className="jobMetaItem">
          <span>Company Email</span>
          <input value={job.companyEmail || ""} disabled />
        </div>
      </div>

      <div className="jobSection">
        <div className="jobSectionHeader">
          <h2>Overview</h2>
        </div>
        <div className="jobSectionGrid">
          <div>
            <div className="jobLabel">Company</div>
            <div className="jobValue">{job.company}</div>
          </div>
          <div>
            <div className="jobLabel">Role</div>
            <div className="jobValue">{job.position}</div>
          </div>
          <div>
            <div className="jobLabel">Job Link</div>
            {job.postingUrl ? (
              <a href={job.postingUrl} target="_blank" rel="noreferrer">
                View Posting
              </a>
            ) : (
              <span className="muted">—</span>
            )}
          </div>
          <div className="jobNotes">
            <div className="jobLabel">Notes</div>
            <div className="jobValue">{job.notes || "—"}</div>
          </div>
        </div>
      </div>

      <div className="jobSection">
        <div className="jobSectionHeader">
          <h2>Resume for this Job</h2>
          <p className="muted">This resume is specific to this job and does not affect your master resume.</p>
        </div>
        <div className="jobActions">
          <button className="primary" onClick={onOpenResume}>Edit Resume</button>
          <button className="ghost" onClick={onOpenResume}>View Resume</button>
          <button className="ghost" onClick={handleClone} disabled={isBusy}>
            Clone from Master
          </button>
        </div>
        <div className="jobMetaLine">
          <span className="muted">
            {resumeMeta.exists ? `Last edited: ${formatDate(resumeMeta.updatedAt)}` : "No tailored resume yet."}
          </span>
        </div>
      </div>

      <div className="jobSection">
        <div className="jobSectionHeader">
          <h2>Application Updates</h2>
          <p className="muted">Track emails, interviews, and responses.</p>
        </div>
        {(job.communications || []).length === 0 ? (
          <div className="muted">No updates yet.</div>
        ) : (
          <div className="jobTimeline">
            {job.communications.map((log) => (
              <div key={log.id} className="jobTimelineItem">
                <div className="jobTimelineDate">{formatDate(log.timestamp)}</div>
                <div className="jobTimelineText">{log.note}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
