import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./components/Navbar.jsx";
import ListView from "./components/ListView.jsx";
import ApplicationForm from "./components/ApplicationForm.jsx";
import KanbanDashboard from "./components/KanbanDashboard";

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
      setPage("list");
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
    setApps(apps.map((a) => (a.id === id ? { ...a, ...patch } : a)));

    if (patch.status) {
      try {
        await axios.patch(`http://127.0.0.1:8000/api/jobs/${id}/`, {
          status: STATUS_TO_API[patch.status] || patch.status,
        });
      } catch (err) {
        console.error("Failed to sync status with backend:", err);
      }
    }
  }

  return (
    <div className="app">
      <Navbar
        onDashboard={() => setPage("list")}
        onAdd={() => setPage("add")}
      />

      <div className="grid">
        <div className="panel">
          {page === "list" && view === "list" && (
            <ListView
              apps={apps}
              statuses={DEFAULT_STATUSES}
              selectedId={selectedId}
              onSelect={setSelectedId}
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
                onOpenMasterResume={() => {}}
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
        </div>
      </div>

      <footer className="footer">
        <span>Data is synced from the Django server.</span>
      </footer>
    </div>
  );
}