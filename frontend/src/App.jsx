import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./components/Navbar.jsx";
import ApplicationList from "./components/ApplicationList.jsx";
import ApplicationForm from "./components/ApplicationForm.jsx";
import KanbanDashboard from "./components/KanbanDashboard";
import MasterResume from "./components/master_resume.jsx";
import TailoredResumeEditor from "./components/TailoredResumeEditor.jsx";
import CommunicationLog from "./components/CommunicationLog.jsx";

import { clone_tailored_resume, update_tailored_resume } from "./components/api/api";

const API_BASE = "http://127.0.0.1:8000/api";

const DEFAULT_STATUSES = ["Applied", "Interview", "Offer", "Rejection"];
const STATUS_TO_API = {
  Applied: "APPLIED",
  Interview: "INTERVIEW",
  Offer: "OFFER",
  Rejection: "REJECTED",
};
const STATUS_FROM_API = {
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejection",
};

function mapLogsToCommunications(logs) {
  const arr = (logs || []).map((l) => ({
    id: l.id,
    note: l.note,
    timestamp: l.timestamp || l.created_at,
    created_at: l.created_at,
  }));
  arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return arr;
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleDateString();
}

export default function App() {
  const [view, setView] = useState("list"); // list | kanban
  const [page, setPage] = useState("list"); // list | add | master | tailored | job

  const [apps, setApps] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // 1) 加载 jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE}/jobs/`);
        const formatted = response.data.map((job) => ({
          id: job.id,
          company: job.company,
          companyEmail: job.company_email || "",
          position: job.role,
          dateApplied: job.date_applied,
          status: STATUS_FROM_API[job.status] || job.status,
          notes: job.notes || "",
          followUpDate: job.follow_up_date || "",
          postingUrl: job.posting_url || "",
          imageUrl: job.image_url || "",
          communications: mapLogsToCommunications(job.logs),
        }));
        setApps(formatted);
      } catch (err) {
        console.error("API fetch failed. Is the backend running?", err);
      }
    };
    loadJobs();
  }, []);

  const selected = useMemo(
    () => apps.find((a) => a.id === selectedId) ?? null,
    [apps, selectedId]
  );

  // 2) 新增 job
  async function addApp(app) {
    try {
      const response = await axios.post(`${API_BASE}/jobs/`, {
        company: app.company.trim(),
        company_email: (app.companyEmail || "").trim(),
        role: app.position.trim(),
        date_applied: app.dateApplied,
        status: STATUS_TO_API[app.status] || "APPLIED",
        notes: app.notes ?? "",
        follow_up_date: app.followUpDate || null,
        posting_url: app.postingUrl?.trim() || "",
        image_url: app.imageUrl?.trim() || "",
      });

      const job = response.data;
      const newItem = {
        id: job.id,
        company: job.company,
        companyEmail: job.company_email || "",
        position: job.role,
        dateApplied: job.date_applied,
        status: STATUS_FROM_API[job.status] || job.status,
        notes: job.notes || "",
        followUpDate: job.follow_up_date || "",
        postingUrl: job.posting_url || "",
        imageUrl: job.image_url || "",
        communications: mapLogsToCommunications(job.logs),
      };

      setApps((prev) => [newItem, ...prev]);
      setSelectedId(newItem.id);

      // 简历逻辑保持你原本的
      if (app.resumeMode === "blank") {
        await update_tailored_resume(newItem.id, "");
      } else {
        await clone_tailored_resume(newItem.id);
      }

      setPage("job"); // 新增完直接进详情页也更像你要的
      setView("list");
    } catch (err) {
      console.error("Failed to save job to database:", err);
    }
  }

  // 3) 更新 job（status/notes/follow-up）
  async function updateApp(id, patch) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

    try {
      const payload = {};
      if (patch.status) payload.status = STATUS_TO_API[patch.status] || patch.status;
      if (patch.notes !== undefined) payload.notes = patch.notes;
      if (patch.followUpDate !== undefined) payload.follow_up_date = patch.followUpDate || null;

      if (Object.keys(payload).length > 0) {
        await axios.patch(`${API_BASE}/jobs/${id}/`, payload);
      }
    } catch (err) {
      console.error("Failed to sync update with backend:", err);
    }
  }

  // 4) 删除 job
  async function deleteApp(id) {
    try {
      await axios.delete(`${API_BASE}/jobs/${id}/`);
      setApps((prev) => prev.filter((a) => a.id !== id));
      if (selectedId === id) setSelectedId(null);
      setPage("list");
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  }

  // 5) US5: 添加 Communication Log -> POST /api/jobs/<id>/logs/
  async function addCommunication(jobId, entry) {
    const note = (entry?.note || "").trim();
    if (!note) return;

    const timestamp = entry?.timestamp || new Date().toISOString();

    try {
      const resp = await axios.post(`${API_BASE}/jobs/${jobId}/logs/`, {
        note,
        timestamp,
      });

      const newLog = {
        id: resp.data.id,
        note: resp.data.note,
        timestamp: resp.data.timestamp || resp.data.created_at,
        created_at: resp.data.created_at,
      };

      setApps((prev) =>
        prev.map((a) => {
          if (a.id !== jobId) return a;
          const next = [newLog, ...(a.communications || [])];
          next.sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp));
          return { ...a, communications: next };
        })
      );
    } catch (err) {
      console.error("Failed to add log:", err);
    }
  }

  function openJobPage(id) {
    setSelectedId(id);
    setPage("job");
    setView("list");
  }

  return (
    <div className="app">
      <Navbar
        onDashboard={() => {
          setPage("list");
          setView("list");
        }}
        onMasterResume={() => setPage("master")}
        onAdd={() => setPage("add")}
      />

      <div className="grid">
        <div className="panel">
          {/* 单个 Job 详情页（你目标图那种） */}
          {page === "job" && selected && (
            <JobDetailPage
              job={selected}
              statuses={DEFAULT_STATUSES}
              onBack={() => setPage("list")}
              onUpdate={(patch) => updateApp(selected.id, patch)}
              onDelete={() => deleteApp(selected.id)}
              onAddLog={(entry) => addCommunication(selected.id, entry)}
              onOpenTailored={() => setPage("tailored")}
            />
          )}

          {/* Dashboard 列表 */}
          {page === "list" && view === "list" && (
            <ApplicationList
              apps={apps}
              statuses={DEFAULT_STATUSES}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={deleteApp}
              onUpdate={updateApp}
              onAddCommunication={addCommunication}
              onOpenJob={openJobPage}  // ✅ 关键：列表里点 “View/打开” 要调用它
            />
          )}

          {/* Kanban */}
          {page === "list" && view === "kanban" && (
            <div className="kanbanWrapper">
              <div className="kanbanTopBar">
                <div>
                  <h2>My Applications</h2>
                  <p className="muted">Drag cards to update their status.</p>
                </div>
                <button className="ghost" onClick={() => setView("list")}>
                  Change View
                </button>
              </div>

              <KanbanDashboard
                apps={apps}
                statuses={DEFAULT_STATUSES}
                onMove={(id, newStatus) =>
                  updateApp(id, {
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                  })
                }
                onAddApplication={() => setPage("add")}
                onOpenMasterResume={() => setPage("master")}
                onView={(id) => openJobPage(id)}
                hideActions
              />
            </div>
          )}

          {/* Add */}
          {page === "add" && (
            <ApplicationForm
              statuses={DEFAULT_STATUSES}
              onSubmit={addApp}
              onCancel={() => setPage("list")}
            />
          )}

          {page === "master" && <MasterResume onBack={() => setPage("list")} />}

          {page === "tailored" && (
            <TailoredResumeEditor job={selected} onBack={() => setPage("job")} />
          )}
        </div>
      </div>

      <footer className="footer">
        <span>Data is synced from the Django server.</span>
      </footer>
    </div>
  );
}

function JobDetailPage({ job, statuses, onBack, onUpdate, onDelete, onAddLog, onOpenTailored }) {
  const moveNext = () => {
    const idx = statuses.indexOf(job.status);
    const next = idx >= 0 && idx < statuses.length - 1 ? statuses[idx + 1] : job.status;
    if (next && next !== job.status) onUpdate({ status: next });
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <button className="ghost" onClick={onBack} style={{ marginBottom: 12 }}>
        ← Back to Dashboard
      </button>

      <h1 style={{ margin: "6px 0 10px" }}>
        {job.company} — {job.position}
      </h1>

      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <div>
          <div className="muted" style={{ fontSize: 13 }}>Status</div>
          <select
            value={job.status}
            onChange={(e) => onUpdate({ status: e.target.value })}
            style={{ padding: "8px 10px", borderRadius: 8 }}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="muted" style={{ fontSize: 13 }}>Applied</div>
          <div>{formatDate(job.dateApplied)}</div>
        </div>

        <div>
          <div className="muted" style={{ fontSize: 13 }}>Follow-up</div>
          <input
            type="date"
            value={job.followUpDate || ""}
            onChange={(e) => onUpdate({ followUpDate: e.target.value })}
            style={{ padding: "8px 10px", borderRadius: 8 }}
          />
        </div>
      </div>

      <hr />

      <h3 style={{ marginTop: 16 }}>📌 Overview</h3>
      <div style={{ lineHeight: 1.8 }}>
        <div><b>Company:</b> {job.company}</div>
        <div><b>Role:</b> {job.position}</div>
        {job.postingUrl ? (
          <div>
            <b>Job Link:</b>{" "}
            <a href={job.postingUrl} target="_blank" rel="noreferrer">View Posting</a>
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>Notes</div>
        <textarea
          rows={4}
          value={job.notes || ""}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          style={{ width: "100%", padding: 10, borderRadius: 10 }}
        />
      </div>

      <hr />

      <h3 style={{ marginTop: 16 }}>☑ Resume for this Job</h3>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="ghost" onClick={onOpenTailored}>View / Edit</button>
        <button className="ghost" onClick={onOpenTailored}>Clone from Master</button>
      </div>

      <hr />

      {/* ✅ Communication Log：这里就是你 US5 要实现的重点 */}
      <CommunicationLog communications={job.communications || []} onAdd={onAddLog} />

      <hr />

      <h3 style={{ marginTop: 16 }}>📱 Actions</h3>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={moveNext}>Move to Next Stage</button>
        <button className="ghost" onClick={onBack}>Archive</button>
        <button className="danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
