import React, { useMemo } from "react";

export default function ResumeEditor({
  masterResume, onSaveMaster, apps, selected, onSelectId, onUpdateApp
}) {
  const list = useMemo(() => apps.slice(0, 50), [apps]);

  return (
    <div className="split">
      <div className="left">
        <h2>Resumes</h2>
        <p className="muted">Edit your master resume, then tailor it per application.</p>

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
          <h3>Master Resume</h3>
          <input
            className="titleInput"
            value={masterResume.title}
            onChange={(e) => onSaveMaster({ ...masterResume, title: e.target.value })}
          />
          <textarea
            rows={12}
            value={masterResume.content}
            onChange={(e) => onSaveMaster({ ...masterResume, content: e.target.value })}
          />
        </section>

        <section className="section">
          <h3>Tailored Resume (per application)</h3>
          {!selected ? (
            <p className="muted">Select an application to create/edit a tailored resume.</p>
          ) : (
            <>
              <p className="muted">
                Tip: copy from master, then tweak keywords for {selected.company}.
              </p>
              <button
                className="ghost"
                onClick={() => onUpdateApp(selected.id, { tailoredResume: masterResume.content })}
              >
                Copy Master → Tailored
              </button>
              <textarea
                rows={12}
                value={selected.tailoredResume || ""}
                onChange={(e) => onUpdateApp(selected.id, { tailoredResume: e.target.value })}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
