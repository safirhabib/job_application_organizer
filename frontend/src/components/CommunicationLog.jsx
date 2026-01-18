import React, { useMemo, useState } from "react";

function formatTs(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString();
}

export default function CommunicationLog({ communications = [], onAdd }) {
  const [note, setNote] = useState("");
  const [timestamp, setTimestamp] = useState(""); // datetime-local: "2026-01-18T10:00"

  const sorted = useMemo(() => {
    const arr = [...communications];
    arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return arr;
  }, [communications]);

  function submit(e) {
    e.preventDefault();
    const n = note.trim();
    if (!n) return;

    onAdd?.({
      note: n,
      // 如果用户不填时间，就让 App.jsx 用当前时间兜底也行；这里也给一个兜底
      timestamp: timestamp || new Date().toISOString(),
    });

    setNote("");
    setTimestamp("");
  }

  return (
    <section style={{ marginTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h3 style={{ margin: 0 }}>💬 Communication Log</h3>
      </div>

      <form onSubmit={submit} style={{ marginTop: 10, display: "grid", gap: 8 }}>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder='e.g., Interview invite received (Email)'
          style={{ width: "100%", padding: 10, borderRadius: 10 }}
        />

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12, opacity: 0.75 }}>Timestamp (optional)</span>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              style={{ padding: 10, borderRadius: 10 }}
            />
          </label>

          <button className="primary" type="submit" style={{ height: 40 }}>
            Add Entry
          </button>
        </div>
      </form>

      <div style={{ marginTop: 12 }}>
        {sorted.length === 0 ? (
          <p className="muted">No logs yet.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {sorted.map((c) => (
              <li key={c.id || `${c.timestamp}-${c.note}`} style={{ marginBottom: 8 }}>
                <b>{formatTs(c.timestamp)} —</b> {c.note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
