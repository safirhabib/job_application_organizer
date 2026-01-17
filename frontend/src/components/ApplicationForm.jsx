import React, { useState } from "react";

export default function ApplicationForm({ statuses, onSubmit }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    company: "",
    position: "",
    dateApplied: today,
    status: statuses[0],
    followUpDate: "",
    notes: ""
  });


  return (
    <div>
      <h2>Add Application</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Company
          <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="e.g., Google" />
        </label>

        <label>
          Position
          <input value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="e.g., SWE Intern" />
        </label>

        <div className="row">
          <label>
            Date Applied
            <input type="date" value={form.dateApplied} onChange={(e) => set("dateApplied", e.target.value)} />
          </label>

          <label>
            Status
            <select value={form.status} onChange={(e) => set("status", e.target.value)}>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Follow-up reminder date (optional)
          <input type="date" value={form.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} />
        </label>

        <label>
          Notes
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={4} />
        </label>

        <button className="primary" type="submit">Add</button>
      </form>
    </div>
  );
}
function set(key, val) {
  setForm((p) => ({ ...p, [key]: val }));
}

function handleSubmit(e) {
  e.preventDefault();
  if (!form.company.trim() || !form.position.trim()) return;
  onSubmit(form);
  setForm({
    company: "",
    position: "",
    dateApplied: today,
    status: statuses[0],
    followUpDate: "",
    notes: ""
  });
}
