import React, { useMemo, useState } from "react";

const DEFAULT_IMAGE = "/job-placeholder.svg";

const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest" },
  { value: "date_asc", label: "Oldest" },
  { value: "company_asc", label: "Company (A–Z)" },
  { value: "status", label: "Status" },
];

export default function ListView({
  apps,
  statuses,
  selectedId,
  onSelect,
  onChangeView,
  onChangeViewValue,
  view,
}) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/d922bb2f-772d-476b-9c3a-9815e2d08fee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ListView.jsx:15',message:'render',data:{appsCount:apps?.length,view},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  const [sortKey, setSortKey] = useState("date_desc");

  const statusOrder = useMemo(() => {
    const map = new Map();
    statuses.forEach((status, index) => map.set(status, index));
    return map;
  }, [statuses]);

  const sortedApps = useMemo(() => {
    const sorted = [...apps];
    sorted.sort((a, b) => {
      if (sortKey === "company_asc") {
        return a.company.localeCompare(b.company);
      }
      if (sortKey === "status") {
        return (statusOrder.get(a.status) ?? 99) - (statusOrder.get(b.status) ?? 99);
      }
      const dateA = a.dateApplied ? new Date(a.dateApplied).getTime() : 0;
      const dateB = b.dateApplied ? new Date(b.dateApplied).getTime() : 0;
      return sortKey === "date_asc" ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }, [apps, sortKey, statusOrder]);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/d922bb2f-772d-476b-9c3a-9815e2d08fee',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ListView.jsx:41',message:'sortedApps computed',data:{sortKey,count:sortedApps.length},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion

  return (
    <section className="listView">
      <div className="listViewHeader">
        <div>
        </div>
        <div className="listViewActions">
          <label className="sortControl">
            <span>Sort</span>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <button className="ghost" onClick={onChangeView}>Change View</button>
        </div>
      </div>

      <div className="mobileControls">
        <label className="sortControl">
          <span>View</span>
          <select value={view} onChange={(e) => onChangeViewValue(e.target.value)}>
            <option value="list">List</option>
            <option value="kanban">Kanban</option>
          </select>
        </label>
        <label className="sortControl">
          <span>Sort</span>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {sortedApps.length === 0 ? (
        <div className="empty">
          <h3>No applications yet</h3>
          <p className="muted">Add your first application to populate the list.</p>
        </div>
      ) : (
        <div className="cardGrid">
          {sortedApps.map((app) => (
            <article
              key={app.id}
              className={`jobCard ${app.id === selectedId ? "selected" : ""}`}
              tabIndex={0}
              role="button"
              onClick={() => onSelect?.(app.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSelect?.(app.id);
              }}
            >
              <div className="jobCardImage">
                <img
                  src={app.imageUrl || DEFAULT_IMAGE}
                  alt={`${app.company} logo`}
                  loading="lazy"
                />
              </div>
              <div className="jobCardBody">
                <div className="jobCardHeader">
                  <div>
                    <h3>{app.position}</h3>
                    <p className="muted">{app.company}</p>
                  </div>
                  <span className={`badge ${badgeClass(app.status)}`}>{app.status}</span>
                </div>
                <div className="jobMeta">
                  <span>Applied: {app.dateApplied || "—"}</span>
                </div>
              </div>
              <div className="jobCardFooter">
                <button className="primary" type="button">View Details</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
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

