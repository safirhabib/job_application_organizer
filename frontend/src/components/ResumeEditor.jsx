import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  clone_tailored_resume,
  get_master_resume,
  get_tailored_resume,
  update_master_resume,
  update_tailored_resume,
} from "./api/api";

export default function ResumeEditor({
  apps, selected, onSelectId, onUpdateApp
}) {
  const list = useMemo(() => apps.slice(0, 50), [apps]);
  const [masterText, setMasterText] = useState("");
  const [tailoredText, setTailoredText] = useState("");
  const [masterStatus, setMasterStatus] = useState("Idle");
  const [tailoredStatus, setTailoredStatus] = useState("Select an application");
  const [isMasterBusy, setIsMasterBusy] = useState(false);
  const [isTailoredBusy, setIsTailoredBusy] = useState(false);
  const updateAppRef = useRef(onUpdateApp);

  useEffect(() => {
    updateAppRef.current = onUpdateApp;
  }, [onUpdateApp]);

  useEffect(() => {
    const loadMaster = async () => {
      setIsMasterBusy(true);
      setMasterStatus("Loading...");
      try {
        const res = await get_master_resume();
        setMasterText(res.data.content || "");
        setMasterStatus("Loaded");
      } catch (error) {
        console.error(error);
        setMasterStatus("Failed to load");
      } finally {
        setIsMasterBusy(false);
      }
    };

    loadMaster();
  }, []);

  useEffect(() => {
    if (!selected?.id) {
      setTailoredText("");
      setTailoredStatus("Select an application");
      return;
    }

    setTailoredText(selected.tailoredResume || "");
    setTailoredStatus(selected.tailoredResume ? "Loaded locally" : "Loading...");

    const loadTailored = async () => {
      setIsTailoredBusy(true);
      try {
        const res = await get_tailored_resume(selected.id);
        setTailoredText(res.data.content || "");
        setTailoredStatus(res.data.exists ? "Loaded" : "New resume");
        if (res.data.content) {
          updateAppRef.current(selected.id, { tailoredResume: res.data.content });
        }
      } catch (error) {
        console.error(error);
        setTailoredStatus("Using local draft (offline)");
      } finally {
        setIsTailoredBusy(false);
      }
    };

    loadTailored();
  }, [selected?.id]);

  const handleSaveMaster = async () => {
    setIsMasterBusy(true);
    setMasterStatus("Saving...");
    try {
      await update_master_resume(masterText);
      setMasterStatus("Saved");
    } catch (error) {
      console.error(error);
      setMasterStatus("Save failed");
    } finally {
      setIsMasterBusy(false);
    }
  };

  const handleSaveTailored = async () => {
    if (!selected?.id) return;
    setIsTailoredBusy(true);
    setTailoredStatus("Saving...");
    try {
      await update_tailored_resume(selected.id, tailoredText);
      setTailoredStatus("Saved");
      updateAppRef.current(selected.id, { tailoredResume: tailoredText });
    } catch (error) {
      console.error(error);
      setTailoredStatus("Save failed");
    } finally {
      setIsTailoredBusy(false);
    }
  };

  const handleClone = async () => {
    if (!selected?.id) return;
    setIsTailoredBusy(true);
    setTailoredStatus("Cloning...");
    try {
      const res = await clone_tailored_resume(selected.id);
      setTailoredText(res.data.content || "");
      setTailoredStatus("Cloned from master");
      updateAppRef.current(selected.id, { tailoredResume: res.data.content || "" });
    } catch (error) {
      console.error(error);
      setTailoredStatus("Clone failed");
    } finally {
      setIsTailoredBusy(false);
    }
  };

  return (
    <div className="split">
      <div className="left">
        <h2>Resumes</h2>
        <p className="muted">Edit your master resume, then clone and tailor it per application.</p>

        <div className="section">
          <h3>Pick an application</h3>
          <select
            value={selected?.id || ""}
            onChange={(e) => onSelectId(e.target.value || null)}
          >
            <option value="">(none selected)</option>
            {list.map(a => (
              <option key={a.id} value={a.id}>
                {a.company} — {a.position}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="right">
        <section className="section">
          <div className="sectionHeader">
            <div>
              <h3>Master Resume (LaTeX)</h3>
              <p className="muted">Stored on the server. {masterStatus}</p>
            </div>
            <div className="actions">
              <button className="ghost" onClick={() => setMasterText("")} disabled={isMasterBusy}>
                Clear
              </button>
              <button className="primary" onClick={handleSaveMaster} disabled={isMasterBusy}>
                Save Master
              </button>
            </div>
          </div>
          <textarea
            rows={12}
            value={masterText}
            onChange={(e) => setMasterText(e.target.value)}
            placeholder="Paste your LaTeX master resume here..."
          />
        </section>

        <section className="section">
          <div className="sectionHeader">
            <div>
          <h3>Tailored Resume (per application)</h3>
              <p className="muted">
                {selected ? `${selected.company} — ${selected.position}` : "Select an application to start."}
              </p>
              <p className="muted">Status: {tailoredStatus}</p>
            </div>
            <div className="actions">
              <button className="ghost" onClick={handleClone} disabled={!selected || isTailoredBusy}>
                Clone from Master
              </button>
              <button className="primary" onClick={handleSaveTailored} disabled={!selected || isTailoredBusy}>
                Save Tailored
              </button>
            </div>
          </div>
          {!selected ? (
            <p className="muted">Select an application to create/edit a tailored resume.</p>
          ) : (
            <>
              <p className="muted">
                Tip: copy from master, then tweak keywords for {selected.company}.
              </p>
              <textarea
                rows={12}
                value={tailoredText}
                onChange={(e) => {
                  const next = e.target.value;
                  setTailoredText(next);
                  if (selected?.id) {
                    updateAppRef.current(selected.id, { tailoredResume: next });
                    setTailoredStatus("Editing...");
                  }
                }}
                placeholder="Tailor the LaTeX for this application..."
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
