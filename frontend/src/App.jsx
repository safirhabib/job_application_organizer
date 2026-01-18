import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./components/Navbar.jsx";
import ListView from "./components/ListView.jsx";
import ApplicationForm from "./components/ApplicationForm.jsx";
import KanbanDashboard from "./components/KanbanDashboard";
import MasterResume from "./components/master_resume.jsx";
import TailoredResumeEditor from "./components/TailoredResumeEditor.jsx";
import JobDetailPage from "./components/JobDetailPage.jsx";
import TodoPage from "./components/TodoPage.jsx";
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
  //const [view, setView] = useState("kanban"); // kanban | list
  const [page, setPage] = useState("list"); // list | add | master | tailored | job

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("jao_theme") || "light";
  });
  const [view, setView] = useState("list");
  const [apps, setApps] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("jao_theme", theme);
  }, [theme]);

  useEffect(() => {
    const loadJobs = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d922bb2f-772d-476b-9c3a-9815e2d08fee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:56',message:'loadJobs start',data:{endpoint:`${API_BASE}/jobs/`},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      try {
        const response = await axios.get(`${API_BASE}/jobs/`);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d922bb2f-772d-476b-9c3a-9815e2d08fee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:59',message:'loadJobs response',data:{status:response.status,items:Array.isArray(response.data)?response.data.length:null},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d922bb2f-772d-476b-9c3a-9815e2d08fee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:72',message:'setApps done',data:{appsCount:formatted.length},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d922bb2f-772d-476b-9c3a-9815e2d08fee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:74',message:'loadJobs error',data:{message:err?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
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
        company_email: (app.company_email || "").trim(),
        role: app.role.trim(),
        date_applied: app.date_applied,
        status: STATUS_TO_API[app.status] || "APPLIED",
        notes: app.notes ?? "",
        follow_up_date: app.follow_up_date || null,
        posting_url: app.posting_url?.trim() || "",
        image_url: app.image_url?.trim() || "",
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
      if (patch.status) payload.status = STATUS_TO_API[patch.status] || patch.status;
      if (patch.followUpDate !== undefined) payload.follow_up_date = patch.followUpDate || null;
      if (patch.notes !== undefined) payload.notes = patch.notes;

      if (Object.keys(payload).length > 0) {
        await axios.patch(`http://127.0.0.1:8000/api/jobs/${id}/`, payload);
      }
    } catch (err) {
      console.error("Failed to sync update with backend:", err);
    }
  }

  function openJobPage(id) {
    setSelectedId(id);
    setPage("job");
  }

  return (
    <div className={`app ${theme === "dark" ? "theme-dark" : ""}`}>
      <Navbar
        onDashboard={() => {
          setPage("list");
          setView("kanban");
        }}
        onMasterResume={() => setPage("master")}
        onAdd={() => setPage("add")}
        onTodo={() => setPage("todo")}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        theme={theme}
      />

      <div className="grid">
        <div className="panel">
          {page === "job" && selected && (
            <JobDetailPage
              job={selected}
              statuses={DEFAULT_STATUSES}
              selectedId={selectedId}
              onSelect={openJobPage}
              onOpenJob={openJobPage}
              onChangeView={() => setView("kanban")}
              onChangeViewValue={(next) => setView(next)}
              view={view}
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

              <ListView
                apps={apps}
                statuses={DEFAULT_STATUSES}
                selectedId={selectedId}
                onSelect={openJobPage}
                onChangeView={() => setView("kanban")}
                onChangeViewValue={(next) => setView(next)}
                view={view}
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

          {page === "job" && (
            <JobDetailPage
              job={selected}
              statuses={DEFAULT_STATUSES}
              onBack={() => setPage("list")}
              onUpdate={(patch) => updateApp(selected?.id, patch)}
              onOpenResume={() => setPage("tailored")}
            />
          )}

          {page === "tailored" && (
            <TailoredResumeEditor job={selected} onBack={() => setPage("job")} />
          )}

          {page === "todo" && <TodoPage />}
        </div>
      </div>

      <footer className="footer">
        <span>Data is synced from the Django server.</span>
      </footer>
    </div>
  );
}

// function JobDetailPage({ job, statuses, onUpdate, onDelete, onAddLog, onOpenTailored }) {
//   const moveNext = () => {
//     const idx = statuses.indexOf(job.status);
//     if (idx >= 0 && idx < statuses.length - 1) {
//       onUpdate({ status: statuses[idx + 1] });
//     }
//   };

//   return (
//     <div style={{ maxWidth: 860, margin: "0 auto" }}>
//       <h1 style={{ margin: "6px 0 10px" }}>
//         {job.company} — {job.position}
//       </h1>

//       {/* rest unchanged */}
//       <CommunicationLog communications={job.communications || []} onAdd={onAddLog} />

//       <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
//         <button onClick={moveNext}>Move to Next Stage</button>
//         <button className="danger" onClick={onDelete}>Delete</button>
//       </div>
//     </div>
//   );
// }
