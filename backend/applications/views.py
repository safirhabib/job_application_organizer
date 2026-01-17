import React, { useMemo, useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { uid } from "./utils/uid";
import Header from "./components/header.jsx";
import Tabs from "./components/Tabs";
import ApplicationList from "./components/ApplicationList";
import ApplicationForm from "./components/ApplicationForm.jsx";
import ResumeEditor from "./components/ResumeEditor";
import ReminderPanel from "./components/ReminderPanel";
import MasterResume from './components/master_resume';
import JobForm from './JobForm';

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
      communications: []
    };
    setApps([item, ...apps]);
    setSelectedId(item.id);
    setTab("Applications");
  }

  function updateApp(id
