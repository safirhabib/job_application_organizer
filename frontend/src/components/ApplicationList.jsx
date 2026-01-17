import React, { useMemo, useState } from "react";
import CommunicationLog from "./CommunicationLog";

export default function ApplicationList({
  apps, statuses, selectedId, onSelect, onDelete, onUpdate, onAddCommunication
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return apps.filter(a => {
      const matchesQ =
        !qq ||
        a.company.toLowerCase().includes(qq) ||
        a.position.toLowerCase().includes(qq);
      const matchesStatus = filter === "All" || a.status === filter;
      return matchesQ && matchesStatus;
    });
  }, [apps, q, filter]);

  const selected = useMemo(() => apps.find(a => a.id === selectedId) ?? null, [apps, selectedId]);

  return (
    <div className="split">
      <div className="left">
        <div className="toolbar">
          <input
            className="search"
            placeholder="Search company or position..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <ul className="list">
          {filtered.map(a => (
            <li
              key={a.id}
              className={a.id === selectedId ? "item selected" : "item"}
              onClick={() => onSelect(a.id)}
            >
              <div className="itemTop">
                <strong>{a.company}</strong>
                <span className={"badge " + badgeClass(a.status)}>{a.status}</span>
              </div>
              <div className="muted">{a.position}</div>
              <div className="meta">
                <span>Applied: {a.dateApplied}</span>
                {a.followUpDate ? <span>Follow-up: {a.followUpDate}</span> : null}
              </div>
            </li>
          ))}
          {filtered.length === 0 && <li className="muted">No applications yet.</li>}
        </ul>
      </div>

      <div className="right">
        {!selected ? (
          <div className="empty">
            <h3>Select an application</h3>
            <p className="muted">View/edit status, notes, tailored resume, and communication logs.</p>
          </div>
        ) : (
          <div>
            <div className="detailHeader">
              <div>
                <h2>{selected.company}</h2>
                <p className="muted">{selected.position}</p>
              </div>
              <button className="danger" onClick={() => onDelete(selected.id)}>Delete</button>
            </div>

            <div className="row">
              <label className="field">
                Status
                <select
                  value={selected.status}
                  onChange={(e) => onUpdate(selected.id, { status: e.target.value })}
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <label className="field">
                Follow-up date
                <input
                  type="date"
                  value={selected.followUpDate || ""}
                  onChange={(e) => onUpdate(selected.id, { followUpDate: e.target.value })}
                />
              </label>
            </div>

            <label className="field">
              Notes
              <textarea
                rows={5}
                value={selected.notes || ""}
                onChange={(e) => onUpdate(selected.id, { notes: e.target.value })}
              />
            </label>

            <CommunicationLog
              communications={selected.communications || []}
              onAdd={(entry) => onAddCommunication(selected.id, entry)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function badgeClass(status) {
  switch (status) {
    case "Interview": return "b2";
    case "Offer": return "b3";
    case "Rejection": return "b4";
    default: return "b1";
  }
}
