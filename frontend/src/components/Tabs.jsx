import React from "react";

export default function Tabs({ items, value, onChange }) {
  return (
    <nav className="tabs">
      {items.map((t) => (
        <button
          key={t}
          className={t === value ? "tab active" : "tab"}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </nav>
  );
}
