import { useDraggable } from "@dnd-kit/core";

export default function KanbanCard({ app, onView }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: app.id });

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
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.15)",
        cursor: "grab",
      }}
    >
      <div style={{ fontWeight: 800 }}>{app.company}</div>
      <div style={{ opacity: 0.85 }}>{app.position}</div>
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
        Applied: {app.dateApplied || "—"}
      </div>

      {/* View Details button */}
      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()} // prevents starting drag when pressing button
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
