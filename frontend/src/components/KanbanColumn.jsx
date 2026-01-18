import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";

export default function KanbanColumn({ status, title, apps, onView }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 280,
        padding: 12,
        borderRadius: 12,
        background: isOver ? "rgba(100,108,255,0.18)" : "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        minHeight: 280,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10 }}>
        {title} <span style={{ opacity: 0.6 }}>({apps.length})</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {apps.map((app) => (
          <KanbanCard key={app.id} app={app} onView={onView} />
        ))}
      </div>
    </div>
  );
}
