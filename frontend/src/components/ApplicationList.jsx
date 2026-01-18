import React, { useMemo, useState } from "react";
import CommunicationLog from "./CommunicationLog";

function formatDateTimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function ApplicationList({
  job,
  statuses,
  onBack,
  onUpdate,
  onDelete,
  onAddCommunication,
  onEditResume,
  onCloneFromMaster,
}) {
  const [newNote, setNewNote] = useState("");
  const [newTs, setNewTs] = useState(() => formatDateTimeLocal(new Date().toISOString()));

  const title = useMemo(() => {
    if (!job) return "";
    return `${job.company} — ${job.position}`;
  }, [job]);

  const logs = useMemo(() => {
    const arr = job?.communications || [];
    // 按 timestamp 倒序
    return [...arr].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [job]);

  if (!job) {
    return (
      <div className="empty">
        <h3>No job selected</h3>
        <p className="muted">Please select a job from the dashboard or Kanban board.</p>
      </div>
    );
  }


  const nextStatus = (() => {
    const idx = statuses.indexOf(job.status);
    if (idx < 0) return null;
    return statuses[idx + 1] || null;
  })();

  async function submitLog() {
    const note = newNote.trim();
    if (!note) return;

    const iso = newTs ? new Date(newTs).toISOString() : new Date().toISOString();

    await onAddCommunication(job.id, { note, timestamp: iso });
    setNewNote("");
    setNewTs(formatDateTimeLocal(new Date().toISOString()));
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <button className="ghost" onClick={onBack}>← Back to Dashboard</button>
      </div>

      <div className="detailHeader">
        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>
        </div>
        <button className="danger" onClick={() => onDelete(job.id)}>Delete</button>
      </div>

      <div className="row">
        <label className="field">
          Status
          <select
            value={job.status}
            onChange={(e) => onUpdate(job.id, { status: e.target.value })}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="field">
          Applied
          <input
            type="date"
            value={job.dateApplied || ""}
            onChange={(e) => onUpdate(job.id, { dateApplied: e.target.value })}
          />
        </label>

        <label className="field">
          Follow-up
          <input
            type="date"
            value={job.followUpDate || ""}
            onChange={(e) => onUpdate(job.id, { followUpDate: e.target.value })}
          />
        </label>
      </div>

      {/* Overview */}
      <div className="section">
        <div className="sectionHeader">
          <h2 style={{ margin: 0 }}>📌 Overview</h2>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <label className="field">
            Company
            <input
              value={job.company || ""}
              onChange={(e) => onUpdate(job.id, { company: e.target.value })}
              disabled
            />
          </label>

          <label className="field">
            Role
            <input
              value={job.position || ""}
              onChange={(e) => onUpdate(job.id, { position: e.target.value })}
            />
          </label>

          <label className="field">
            Job Link
            <input
              value={job.postingUrl || ""}
              onChange={(e) => onUpdate(job.id, { postingUrl: e.target.value })}
              placeholder="https://..."
            />
          </label>

          {job.postingUrl ? (
            <div>
              <a href={job.postingUrl} target="_blank" rel="noreferrer">
                🔗 View Posting
              </a>
            </div>
          ) : null}

          <label className="field">
            Notes
            <textarea
              rows={4}
              value={job.notes || ""}
              onChange={(e) => onUpdate(job.id, { notes: e.target.value })}
            />
          </label>
        </div>
      </div>

      {/* Resume */}
      <div className="section">
        <div className="sectionHeader">
          <h2 style={{ margin: 0 }}>📄 Resume for this Job</h2>
        </div>
        <div className="actions">
          <button className="ghost" onClick={onEditResume}>Edit Resume</button>
          <button className="ghost" onClick={onCloneFromMaster}>Clone from Master</button>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          （如果你想加 “View Resume” 按钮：通常是打开后端提供的 PDF/Preview endpoint。你们现在 master 有 pdf endpoint，tailored 也可以按同样方式加。）
        </p>
      </div>

      {/* Communication Log */}
      <div className="section">
        <div className="sectionHeader">
          <h2 style={{ margin: 0 }}>💬 Communication Log</h2>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <label className="field">
            Note
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="例如：Jan 18 — Interview invite received (Email)"
            />
          </label>

          <label className="field">
            Timestamp
            <input
              type="datetime-local"
              value={newTs}
              onChange={(e) => setNewTs(e.target.value)}
            />
          </label>

          <div className="actions">
            <button className="primary" onClick={submitLog}>+ Add Entry</button>
          </div>
        </div>

        {/* 你已有的组件：如果你想继续用它展示列表 */}
        <div style={{ marginTop: 10 }}>
          <CommunicationLog
            communications={logs}
            onAdd={() => {}}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="section">
        <div className="sectionHeader">
          <h2 style={{ margin: 0 }}>📱 Actions</h2>
        </div>
        <div className="actions">
          <button
            className="primary"
            disabled={!nextStatus}
            onClick={() => nextStatus && onUpdate(job.id, { status: nextStatus })}
          >
            Move to Next Stage
          </button>
          <button className="ghost" onClick={onBack}>Archive (UI only)</button>
          <button className="danger" onClick={() => onDelete(job.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}
