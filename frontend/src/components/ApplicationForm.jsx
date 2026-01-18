import React, { useState } from "react";

export default function ApplicationForm({ statuses, onSubmit, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    company: "",
    companyEmail: "",
    position: "",
    dateApplied: today,
    status: statuses[0],
    postingUrl: "",
    followUpDate: "",
    notes: "",
    imageUrl: "",
    resumeMode: "master",
  });

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company.trim() || !form.position.trim()) return;
    onSubmit(form);
    setForm({
      company: "",
      companyEmail: "",
      position: "",
      dateApplied: today,
      status: statuses[0],
      postingUrl: "",
      followUpDate: "",
      notes: "",
      imageUrl: "",
      resumeMode: "master",
    });
  };

  return (
    <div className="formPage">
      <div className="formCard">
        <div className="formHeader">
          <h2>Add Job Application</h2>
          <p className="muted">Keep track of where you’ve applied.</p>
        </div>

        <form className="formStack" onSubmit={handleSubmit}>
          <label className="field">
            Company Name
            <input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Google"
              required
            />
          </label>

          <label className="field">
            Company Email
            <input
              type="email"
              value={form.companyEmail}
              onChange={(e) => set("companyEmail", e.target.value)}
              placeholder="recruiter@company.com"
            />
          </label>

          <label className="field">
            Role / Position
            <input
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              placeholder="Software Engineer Intern"
              required
            />
          </label>

          <label className="field">
            Application Status
            <select value={form.status} onChange={(e) => set("status", e.target.value)}>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="field">
            Date Applied
            <input
              type="date"
              value={form.dateApplied}
              onChange={(e) => set("dateApplied", e.target.value)}
            />
          </label>

          <label className="field">
            Job Posting Link (optional)
            <input
              value={form.postingUrl}
              onChange={(e) => set("postingUrl", e.target.value)}
              placeholder="https://careers.company.com/..."
            />
          </label>

          <label className="field">
            Follow-up Date (optional)
            <input
              type="date"
              value={form.followUpDate}
              onChange={(e) => set("followUpDate", e.target.value)}
            />
          </label>

          <label className="field">
            Notes (optional)
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={4}
            />
          </label>

          <label className="field">
            Company Logo URL (optional)
            <input
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://..."
            />
          </label>

          <div className="field">
            <span>Resume for this job</span>
            <label className="radioRow">
              <input
                type="radio"
                checked={form.resumeMode === "master"}
                onChange={() => set("resumeMode", "master")}
              />
              Use Master Resume (recommended)
            </label>
            <label className="radioRow">
              <input
                type="radio"
                checked={form.resumeMode === "blank"}
                onChange={() => set("resumeMode", "blank")}
              />
              Start with Blank Resume
            </label>
          </div>

          <div className="formActions">
            <button className="primary" type="submit">Create Application</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
