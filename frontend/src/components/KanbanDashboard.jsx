import { DndContext } from "@dnd-kit/core";
import KanbanColumn from "./KanbanColumn";

export default function KanbanDashboard({
  apps,
  statuses,
  onMove,
  onAddApplication,
  onOpenMasterResume,
  onView,
  hideActions = false,
}) {
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const appId = active.id;
    const newStatus = over.id;

    // (optional) avoid extra state updates if dropped in same column
    const current = apps.find((a) => a.id === appId);
    if (current?.status === newStatus) return;

    onMove(appId, newStatus);
  }

  return (
    <div className="kanban">
      <div className="kanbanHeader">

        {!hideActions && (
          <div className="kanbanActions">
            <button onClick={onOpenMasterResume}>Master Resume</button>
            <button onClick={onAddApplication}>Add Application</button>
          </div>
        )}
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="kanbanBoard">
          {statuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              title={status}
              apps={apps.filter((a) => a.status === status)}
              onView={onView}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
