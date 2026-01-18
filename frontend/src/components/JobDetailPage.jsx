// src/components/JobDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const STATUS_OPTIONS = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

function fmtDate(dtStr) {
  if (!dtStr) return "";
  const d = new Date(dtStr);
  return d.toLocaleDateString();
}

export default function JobDetailPage() {
  const { id } = useParams(); // /jobs/:id
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [logs, setLogs] = useState([]);
  const [note, setNote] = useState("");
  const [timestamp, setTimestamp] = useState(""); // "2026-01-18T10:00" or date-only

  async function load() {
    const jobRes = await fetch(`/api/jobs/${id}/`);
    if (!jobRes.ok) throw new Error("Failed to load job");
    const jobData = await jobRes.json();
    setJob(jobData);

    const logsRes = await fetch(`/api/jobs/${id}/logs/`);
    const logsData = await logsRes.json();
    setLogs(logsData);
  }

  useEffect(() => {
    load().catch((e) => console.error(e));
  }, [id]);

  async function addLog(e) {
    e.preventDefault();
    if (!note.trim()) return;

    // DRF DateTimeField 最稳：ISO string
    const ts = timestamp
      ? new Date(timestamp).toISOString()
      : new Date().toISOString();

    const res = await fetch(`/api/jobs/${id}/logs/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, timestamp: ts }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(err);
      alert("POST failed");
      return;
    }

    setNote("");
    setTimestamp("");
    load();
  }

  async function updateStatus(newStatus) {
    const res = await fetch(`/api/jobs/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) load();
  }

  async function deleteJob() {
    const ok = window.confirm("Delete this job?");
    if (!ok) return;
    const res = await fetch(`/api/jobs/${id}/`, { method: "DELETE" });
    if (res.ok) navigate("/"); 
  }

  function moveToNextStage() {
    if (!job) return;
    const order = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
    const idx = order.indexOf(job.status);
    const next = idx >= 0 && idx < 2 ? order[idx + 1] : job.status;
    updateStatus(next);
  }

  if (!job) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <Link to="/" style={{ display: "inline-block", marginBottom: 12 }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ margin: "8px 0 16px" }}>
        {job.company} — {job.role}
      </h1>

      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
        <div>
          Status:{" "}
          <select value={job.status} onChange={(e) => updateStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>Applied: {job.date_applied}</div>
      </div>

      <hr />

      <h2 style={{ marginTop: 16 }}>Communication Log</h2>

      <form onSubmit={addLog} style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input
          style={{ flex: 1 }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., Interview invite received (Email)"
        />
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
        />
        <button type="submit">+ Add Entry</button>
      </form>

      <ul>
        {logs.map((l) => (
          <li key={l.id} style={{ marginBottom: 8 }}>
            <b>{fmtDate(l.timestamp)}</b> — {l.note}
          </li>
        ))}
      </ul>

      <hr style={{ margin: "24px 0" }} />

      <h2>Actions</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={moveToNextStage}>Move to Next Stage</button>
        <button onClick={deleteJob} style={{ background: "#e44", color: "white" }}>
          Delete
        </button>
      </div>
    </div>
  );
}
