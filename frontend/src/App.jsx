import React, { useMemo, useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { uid } from "./utils/uid";
import Header from "./components/header.jsx";
import ApplicationList from "./components/ApplicationList";
import ApplicationForm from "./components/ApplicationForm.jsx";
import ReminderPanel from "./components/ReminderPanel";
import MasterResume from "./components/master_resume";
import JobForm from "./JobForm";
import KanbanDashboard from "./components/KanbanDashboard";

const DEFAULT_STATUSES = ["Applied", "Interview", "Offer", "Rejection"];

export default function App() {
  const [tab, setTab] = useState("Dashboard");

  const [apps, setApps] = useLocalStorage("jao_apps_v1", []);
  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(
    () => apps.find((a) => a.id === selectedId) ?? null,
    [apps, selectedId]
  );

  function addApp(app) {
    const item = {
      id: uid(),
      company: app.company.trim(),
      position: app.position.trim(),
      dateApplied: app.dateApplied,
      status: app.status,
      notes: app.notes ?? "",
      followUpDate: app.followUpDate || "",
      tailoredResume: app.tailoredResume ?? "",
      communications: [],
    };
    setApps([item, ...apps]);
    setSelectedId(item.id);
    setTab("Applications"); // fine to leave, but we send user back to Dashboard after submit below
  }

  function updateApp(id, patch) {
    setApps(apps.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function deleteApp(id) {
    setApps(apps.filter((a) => a.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function addCommunication(id, entry) {
    const target = apps.find((a) => a.id === id);
    if (!target) return;
    const next = {
      id: uid(),
      date: entry.date,
      type: entry.type,
      summary: entry.summary.trim(),
    };
    updateApp(id, { communications: [next, ...(target.communications ?? [])] });
  }

  return (
    <div className="app">
      <Header subtitle="Job Application Organizer (Prototype)" />

      <div className="grid">
        <div className="panel">
          {tab !== "Dashboard" && (
            <div style={{ marginBottom: 12 }}>
              <button onClick={() => setTab("Dashboard")}>← Back</button>
            </div>
          )}

          {tab === "Dashboard" && (
            <KanbanDashboard
              apps={apps}
              statuses={DEFAULT_STATUSES}
              onMove={(id, newStatus) => updateApp(id, { status: newStatus })}
              onAddApplication={() => setTab("Add New")}
              onOpenMasterResume={() => setTab("MasterResume")}
              onView={(id) => {
                setSelectedId(id);
                setTab("Applications");
              }}
            />
          )}

          {tab === "Add New" && (
            <ApplicationForm
              statuses={DEFAULT_STATUSES}
              onSubmit={(app) => {
                addApp(app);
                setTab("Dashboard");
              }}
            />
          )}

          {tab === "MasterResume" && <MasterResume />}

          {/* Optional: keep this hidden unless "View Details" is clicked */}
          {tab === "Applications" && (
            <ApplicationList
              apps={apps}
              statuses={DEFAULT_STATUSES}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={deleteApp}
              onUpdate={updateApp}
              onAddCommunication={addCommunication}
            />
          )}
        </div>
      </div>

      <footer className="footer">
        <span>Applications are saved locally; resumes are saved on the server.</span>
      </footer>
    </div>
  );
}
