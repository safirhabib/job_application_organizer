import React, { useMemo } from "react";

export default function ReminderPanel({ apps, onSelect }) {
  const today = new Date().toISOString().slice(0, 10);

  const due = useMemo(() => {
    return apps
      .filter(a => a.followUpDate && a.followUpDate <= today && a.status !== "Offer" && a.status !== "Rejection")
      .sort((a, b) => (a.followUpDate > b.followUpDate ? 1 : -1));
  }, [apps, today]);

  return (
    <div>
      <h2>Reminders</h2>
      <p className="muted">Follow-ups due today or earlier.</p>

      {due.length === 0 ? (
        <p className="muted">Nothing due 🎉</p>
      ) : (
        <ul className="list">
          {due.map(a => (
            <li key={a.id} className="item" onClick={() => onSelect(a.id)}>
              <div className="itemTop">
                <strong>{a.company}</strong>
                <span className="badge b1">Follow-up</span>
              </div>
              <div className="muted">{a.position}</div>
              <div className="meta">
                <span>Due: {a.followUpDate}</span>
                <span>Status: {a.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
