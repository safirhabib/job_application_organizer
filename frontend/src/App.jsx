import React, { useMemo, useState, useEffect } from "react";
import axios from "axios"; // Aalpesh, ensure you ran 'npm install axios'
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
  const [apps, setApps] = useState([]); // Aalpesh, we now use State instead of LocalStorage
  const [selectedId, setSelectedId] = useState(null);

  // 1. AALPESH'S LIVE DATA FETCH
  useEffect(() => {
    const loadJobs = async () => {
      try {
        // This hits your Django server at Port 8000
        const response = await axios.get("http://127.0.0.1:8000/api/jobs/");
        
        // Aalpesh, we transform Django's data format into your React format
        const formatted = response.data.map(job => ({
          id: job.id,
          company: job.company,
          position: job.role, // Mapping 'role' to 'position'
          dateApplied: job.date_applied,
          // This ensures "APPLIED" becomes "Applied" to match your DEFAULT_STATUSES
          status: job.status.charAt(0).toUpperCase() + job.status.slice(1).toLowerCase(),
          notes: "",
          communications: []
        }));
        setApps(formatted);
      } catch (err) {
        console.error("Aalpesh, the API fetch failed. Is the backend running?", err);
      }
    };
    loadJobs();
  }, []);

  const selected = useMemo(
    () => apps.find((a) => a.id === selectedId) ?? null,
    [apps, selectedId]
  );

  // 2. AALPESH'S SYNCED ADD FUNCTION
  async function addApp(app) {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/jobs/", {
        company: app.company.trim(),
        role: app.position.trim(),
        date_applied: app.dateApplied,
        status: app.status.toUpperCase(), // Backend usually prefers uppercase
      });

      const newItem = {
        ...response.data,
        id: response.data.id,
        position: response.data.role,
        status: response.data.status.charAt(0).toUpperCase() + response.data.status.slice(1).toLowerCase(),
      };

      setApps([newItem, ...apps]);
      setTab("Dashboard");
    } catch (err) {
      console.error("Aalpesh, failed to save job to database:", err);
    }
  }

  async function updateApp(id, patch) {
    // 1. Update the UI immediately for a smooth experience, Aalpesh
    setApps(apps.map((a) => (a.id === id ? { ...a, ...patch } : a)));

    // 2. If the patch contains a 'status' change, send it to Django
    if (patch.status) {
      try {
        await axios.patch(`http://127.0.0.1:8000/api/jobs/${id}/`, {
          status: patch.status.toUpperCase() // Django expects uppercase
        });
        console.log("Aalpesh, the database was updated successfully!");
      } catch (err) {
        console.error("Aalpesh, failed to sync status with backend:", err);
      }
    }
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
              <button onClick={() => setTab("Dashboard")}>← Back to Dashboard</button>
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
              onSubmit={addApp}
            />
          )}

          {tab === "MasterResume" && <MasterResume />}

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
          
          {tab === "JobForm" && <JobForm />}
        </div>
      </div>

      <footer className="footer">
        <span>Aalpesh, data is now live from the Django Server.</span>
      </footer>
    </div>
  );
}