import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./components/Navbar.jsx";
import ListView from "./components/ListView.jsx";
import ApplicationForm from "./components/ApplicationForm.jsx";
import KanbanDashboard from "./components/KanbanDashboard";
import MasterResume from "./components/master_resume.jsx";
import TailoredResumeEditor from "./components/TailoredResumeEditor.jsx";
import JobDetailPage from "./components/JobDetailPage.jsx";
import { clone_tailored_resume, update_tailored_resume } from "./components/api/api";

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

export default function App() {
  const [view, setView] = useState("list");
  const [page, setPage] = useState("list");
  const [apps, setApps] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/jobs/");
        const formatted = response.data.map(job => ({
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
          communications: [],
        }));
        setApps(formatted);
      } catch (err) {
        console.error("API fetch failed. Is the backend running?", err);
      }
    };
    loadJobs();
  }, []);

  async function addApp(app) {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/jobs/", {
        company: app.company.trim(),
        company_email: app.companyEmail.trim(),
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
        communications: [],
      };

      setApps([newItem, ...apps]);
      setSelectedId(newItem.id);

      if (app.resumeMode === "blank") {
        await update_tailored_resume(newItem.id, "");
      } else {
        await clone_tailored_resume(newItem.id);
      }

      setPage("tailored");
      setView("list");
    } catch (err) {
      console.error("Failed to save job to database:", err);
    }
  }

  const selected = useMemo(
    () => apps.find((a) => a.id === selectedId) ?? null,
    [apps, selectedId]
  );

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
    <div className="app">
      <Navbar
        onDashboard={() => setPage("list")}
        onMasterResume={() => setPage("master")}
        onAdd={() => setPage("add")}
      />

      <div className="grid">
        <div className="panel">
          {page === "list" && view === "list" && (
            <ListView
              apps={apps}
              statuses={DEFAULT_STATUSES}
              selectedId={selectedId}
              onSelect={openJobPage}
              onOpenJob={openJobPage}
              onChangeView={() => setView("kanban")}
              onChangeViewValue={(next) => setView(next)}
              view={view}
            />
          )}

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
                onView={(id) => {
                  setSelectedId(id);
                  setView("list");
                }}
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

          {page === "master" && (
            <MasterResume onBack={() => setPage("list")} />
          )}

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
            <TailoredResumeEditor
              job={selected}
              onBack={() => setPage("list")}
            />
          )}
        </div>
      </div>

      <footer className="footer">
        <span>Data is synced from the Django server.</span>
      </footer>
    </div>
  );
}