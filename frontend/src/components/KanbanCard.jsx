import { useDraggable } from "@dnd-kit/core";
import { AlertCircle } from "lucide-react";

export default function KanbanCard({ app, onView }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: app.id });

  const isStale = (Date.now() - new Date(app.updated_at)) > 7 * 24 * 60 * 60 * 1000;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        opacity: isDragging ? 0.65 : 1,
        padding: 12,
        borderRadius: 12,
        background: isStale ? "rgba(255, 0, 0, 0.12)" : "rgba(0,0,0,0.35)",
        border: isStale
          ? "1px solid rgba(255,0,0,0.55)"
          : "1px solid rgba(255,255,255,0.15)",
        cursor: "grab",
      }}
    >
      <div style={{ fontWeight: 800 }}>{app.company}</div>
      <div style={{ opacity: 0.85 }}>{app.role}</div>

      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
        Applied: {app.date_applied || "—"}
      </div>

      {isStale && (
        <div
          style={{
            marginTop: 6,
            color: "rgb(220,38,38)", 
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          title="No updates since a week"
        >
          <AlertCircle size={16} />
          Email this company to follow up!
        </div>
      )}

      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onView?.(app.id);
          }}
          style={{
            padding: "6px 10px",
            fontSize: 12,
            borderRadius: 10,
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
