import React, { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { AlertCircle } from "lucide-react";

export default function KanbanCard({ app, onView }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: app.id });

  // --- STALE LOGIC (30 seconds for testing) ---
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    // if updated_at is missing, fall back to date_applied or "now"
    const baseDate =
      app.updated_at || app.date_applied || new Date().toISOString();
    const lastUpdatedMs = new Date(baseDate).getTime();

    // reset when app.updated_at changes
    setIsStale(false);

    function checkStale() {
      const ageMs = Date.now() - lastUpdatedMs;
      console.log(
        `Card ${app.id} ageMs:`,
        ageMs,
        "seconds:",
        (ageMs / 1000).toFixed(2)
      );

      if (ageMs > 30 * 1000) {
        setIsStale(true);
        return true;
      }
      return false;
    }

    // run once immediately
    if (checkStale()) return;

    // then poll until it becomes stale
    const t = setInterval(() => {
      if (checkStale()) {
        clearInterval(t);
      }
    }, 1000);

    return () => clearInterval(t);
  }, [app.id, app.updated_at, app.date_applied]);

  // --- STYLES ---
  const cardStyle = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    opacity: isDragging ? 0.65 : 1,
    padding: 14,
    borderRadius: 16,
    background: isStale ? "#fee2e2" : "rgba(0,0,0,0.035)",
    border: isStale ? "1px solid #fecaca" : "1px solid rgba(0,0,0,0.08)",
    cursor: "grab",
    boxShadow: isStale
      ? "0 10px 25px rgba(248,113,113,0.25)"
      : "0 6px 16px rgba(15,23,42,0.08)",
    transition: "box-shadow 140ms ease, transform 140ms ease, background-color 160ms ease",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  };

  const headingStyle = {
    fontWeight: 800,
    fontSize: 15,
    color: "#352222",
  };

  const roleStyle = {
    opacity: 0.85,
    fontSize: 13,
    color: "#4b3a3a",
  };

  const appliedStyle = {
    fontSize: 12,
    opacity: 0.75,
    marginTop: 4,
    color: "#6b4b4b",
  };

  const staleRowStyle = {
    marginTop: 10,
    color: "#b91c1c",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 500,
  };

  const footerStyle = {
    marginTop: 10,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8, // gap between buttons
  };

  const subtleTextStyle = {
    fontSize: 11,
    color: "#6b4b4b",
    opacity: 0.8,
    marginTop: 4,
  };

  const buttonBase = {
    padding: "6px 12px",
    fontSize: 12,
    borderRadius: 999,
    border: "1px solid transparent",
    cursor: "pointer",
    fontWeight: 500,
    background: "white",
    color: "#352222",
    boxShadow: "0 4px 10px rgba(15,23,42,0.08)",
    transition:
      "background-color 120ms ease, box-shadow 120ms ease, transform 100ms ease",
  };

  const viewButtonStyle = {
    ...buttonBase,
  };

  const emailButtonStyle = {
    ...buttonBase,
    background: "#ef4444",
    color: "white",
    border: "1px solid #b91c1c",
    boxShadow: "0 8px 18px rgba(248,113,113,0.48)",
  };

  // --- HELPERS ---
  function fmtDateShort(dtStr) {
    if (!dtStr) return "";
    const d = new Date(dtStr);
    return d.toLocaleDateString();
  }

  function buildEmailDraft() {
    const companyName = app.company || "{Company name}";
    const position = app.role || "{Position}";
    const appliedDate = app.date_applied || "{application date}";
    const toEmail = app.company_email || "";

    const subject = `Follow-up on ${position} application at ${companyName}`;

    const bodyLines = [
      "Hi {Hiring Manager},",
      "",
      `I hope you're doing well. I wanted to follow up regarding my application for the ${position} role at ${companyName}, which I submitted on ${appliedDate}. I’m reaching out to see if there have been any updates on the hiring process or the status of my application.`,
      "",
      "If there is any additional information or documentation you need from me, please let me know and I'd be happy to provide it.",
      "",
      "Thank you very much for your time and consideration.",
      "",
      "Best regards,",
      "{Your Name}",
    ];

    return `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
  }

  function handleEmailClick(e) {
    e.stopPropagation();
    const link = buildEmailDraft();
    if (typeof window !== "undefined") {
      window.location.href = link;
    }
  }

  // --- RENDER ---
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={cardStyle}
      onMouseDown={() => {}}
    >
      <div style={headingStyle}>{app.company}</div>
      {app.role && <div style={roleStyle}>{app.role}</div>}

      <div style={appliedStyle}>
        Applied: {fmtDateShort(app.date_applied) || "—"}
      </div>

      {isStale && (
        <>
          <div
            style={staleRowStyle}
            title="No updates for at least a week (3s in dev mode)"
          >
            <AlertCircle size={16} />
            <span>Email this company to follow up.</span>
          </div>
          <div style={subtleTextStyle}>
            A draft email will open with your application details prefilled – just
            review and press send.
          </div>
        </>
      )}

      <div style={footerStyle}>
        {isStale && (
          <button
            type="button"
            style={emailButtonStyle}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleEmailClick}
          >
            Email Company
          </button>
        )}

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onView?.(app.id);
          }}
          style={viewButtonStyle}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
