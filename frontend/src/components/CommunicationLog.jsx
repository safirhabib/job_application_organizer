import React, { useState } from "react";

export default function CommunicationLog({ communications, onAdd }) {
  const today = new Date().toISOString().slice(0, 10);
  const [entry, setEntry] = useState({ date: today, type: "Email", summary: "" });

  function set(k, v) { setEntry(p => ({ ...p, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    if (!entry.summary.trim()) return;
    onAdd(entry);
    setEntry({ date: today, type: "Email", summary: "" });
  }

  return (
    <section className="section">
      <h3>Response & Communication Log</h3>

      <form className="row" onSubmit={submit}>
        <label className="field">
          Date
          <input type="date" value={entry.date} onChange={(e) => set("date", e.target.value)} />
        </label>
        <label className="field">
          Type
          <select value={entry.type} onChange={(e) => set("type", e.target.value)}>
            <option>Email</option>
            <option>Phone</option>
            <option>LinkedIn</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejection</option>
            <option>Other</option>
          </select>
        </label>
        <label className="field grow">
          Summary
          <input value={entry.summary} onChange={(e) => set("summary", e.target.value)} placeholder="e.g., recruiter replied; scheduled interview" />
        </label>
        <button className="primary" type="submit">Add</button>
      </form>

      <div className="log">
        {communications.length === 0 ? (
          <p className="muted">No communications logged yet.</p>
        ) : (
          <ul className="logList">
            {communications.map(c => (
              <li key={c.id} className="logItem">
                <div className="logTop">
                  <strong>{c.type}</strong>
                  <span className="muted">{c.date}</span>
                </div>
                <div>{c.summary}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
