import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./components/Navbar.jsx";
import ApplicationList from "./components/ApplicationList.jsx";
import ApplicationForm from "./components/ApplicationForm.jsx";
import KanbanDashboard from "./components/KanbanDashboard";
import MasterResume from "./components/master_resume.jsx";
import TailoredResumeEditor from "./components/TailoredResumeEditor.jsx";
import JobDetailPage from "./components/JobDetailPage.jsx";

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
  const [view, setView] = useState("kanban"); // kanban | list
  const [page, setPage] = useState("list"); // list | add | master | tailored | job

  const [apps, setApps] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

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

      if (app.resumeMode === "blank") {
        await update_tailored_resume(newItem.id, "");
      } else {
        await clone_tailored_resume(newItem.id);
      }

      setPage("job");
    } catch (err) {
      console.error("Failed to save job to database:", err);
    }
  }

  async function updateApp(id, patch) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

    try {
      const payload = {};
      if (patch.status) payload.status = STATUS_TO_API[patch.status];
      if (patch.notes !== undefined) payload.notes = patch.notes;
      if (patch.followUpDate !== undefined)
        payload.follow_up_date = patch.followUpDate || null;

      if (Object.keys(payload).length > 0) {
        await axios.patch(`${API_BASE}/jobs/${id}/`, payload);
      }
    } catch (err) {
      console.error("Failed to sync update with backend:", err);
    }
  }

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
          return {
            ...a,
            communications: [newLog, ...(a.communications || [])],
          };
        })
      );
    } catch (err) {
      console.error("Failed to add log:", err);
    }
  }

  function openJobPage(id) {
    setSelectedId(id);
    setPage("job");
  }

  return (
    <div className="app">
      <Navbar
        onDashboard={() => {
          setPage("list");
          setView("kanban");
        }}
        onMasterResume={() => setPage("master")}
        onAdd={() => setPage("add")}
      />

      <div className="grid">
        <div className="panel">
          {page === "job" && selected && (
            <JobDetailPage
              job={selected}
              statuses={DEFAULT_STATUSES}
              onUpdate={(patch) => updateApp(selected.id, patch)}
              onDelete={() => deleteApp(selected.id)}
              onAddLog={(entry) => addCommunication(selected.id, entry)}
              onOpenTailored={() => setPage("tailored")}
            />
          )}

          {page === "list" && view === "list" && (
            <div className="listWrapper">
              <div className="kanbanTopBar">
                <div>
                  <h2>My Applications</h2>
                  <p className="muted">Search, edit, and open jobs.</p>
                </div>
                <button className="ghost" onClick={() => setView("kanban")}>
                  Back to Dashboard
                </button>
              </div>

              <ApplicationList
                apps={apps}
                statuses={DEFAULT_STATUSES}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDelete={deleteApp}
                onUpdate={updateApp}
                onAddCommunication={addCommunication}
                onOpenJob={openJobPage}
              />
            </div>
          )}

          {page === "list" && view === "kanban" && (
            <div className="kanbanWrapper">
              <div className="kanbanTopBar">
                <div>
                  <h2>My Applications</h2>
                  <p className="muted">Drag cards to update their status.</p>
                </div>
                <button className="ghost" onClick={() => setView("list")}>
                  Switch to List
                </button>
              </div>

              <KanbanDashboard
                apps={apps}
                statuses={DEFAULT_STATUSES}
                onMove={(id, newStatus) =>
                  updateApp(id, { status: newStatus })
                }
                onAddApplication={() => setPage("add")}
                onOpenMasterResume={() => setPage("master")}
                onView={(id) => openJobPage(id)}
                hideActions
              />
            </div>
          )}

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
