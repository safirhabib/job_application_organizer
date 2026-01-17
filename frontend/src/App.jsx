
import React, { useMemo, useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { uid } from "./utils/uid";
import Header from "./components/header.jsx";
import Tabs from "./components/Tabs";
import ApplicationList from "./components/ApplicationList";
import ApplicationForm from "./components/ApplicationForm.jsx";
import ResumeEditor from "./components/ResumeEditor";
import ReminderPanel from "./components/ReminderPanel";

const DEFAULT_STATUSES = ["Applied", "Interview", "Offer", "Rejection"];

export default function App() {
  const [tab, setTab] = useState("Applications");

  const [apps, setApps] = useLocalStorage("jao_apps_v1", []);
  const [masterResume, setMasterResume] = useLocalStorage("jao_master_resume_v1", {
    title: "Master Resume",
    content: "Paste your master resume here...\n\n• Education...\n• Projects...\n• Experience..."
  });

  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(
    () => apps.find(a => a.id === selectedId) ?? null,
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
      communications: [] // {id, date, type, summary}
    };
    setApps([item, ...apps]);
    setSelectedId(item.id);
    setTab("Applications");
  }

  function updateApp(id, patch) {
    setApps(apps.map(a => (a.id === id ? { ...a, ...patch } : a)));
  }

  function deleteApp(id) {
    setApps(apps.filter(a => a.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function addCommunication(id, entry) {
    const target = apps.find(a => a.id === id);
    if (!target) return;
    const next = {
      id: uid(),
      date: entry.date,
      type: entry.type,
      summary: entry.summary.trim()
    };
    updateApp(id, { communications: [next, ...(target.communications ?? [])] });
  }

  return (
    <div className="app">
      <Header subtitle="Job Application Organizer (Prototype)" />

      <Tabs
        value={tab}
        onChange={setTab}
        items={["Applications", "Add New", "Resumes", "Reminders"]}
      />

      <div className="grid">
        <div className="panel">
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

          {tab === "Add New" && (
            <ApplicationForm statuses={DEFAULT_STATUSES} onSubmit={addApp} />
          )}

          {tab === "Resumes" && (
            <ResumeEditor
              masterResume={masterResume}
              onSaveMaster={setMasterResume}
              selected={selected}
              onSelectId={setSelectedId}
              apps={apps}
              onUpdateApp={updateApp}
            />
          )}

          {tab === "Reminders" && (
            <ReminderPanel
              apps={apps}
              onSelect={id => {
                setSelectedId(id);
                setTab("Applications");
              }}
            />
          )}
        </div>
      </div>

      <footer className="footer">
        <span>Data is saved locally in your browser (LocalStorage).</span>
      </footer>
    </div>
  );
}

