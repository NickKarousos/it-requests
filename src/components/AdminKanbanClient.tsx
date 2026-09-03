"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { Request as PrismaRequest, User } from '@prisma/client';

type RequestWithUser = PrismaRequest & { user: User };
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TimerButton from './TimerButton';

const COLUMNS = [
  { id: 'Urgent', title: 'Urgent' },
  { id: 'Open', title: 'To Do List' },
  { id: 'In Progress', title: 'In Progress (Picked)' },
  { id: 'Resolved', title: 'Done (Completed)' },
];

function SortableItem(props: { id: string; request: RequestWithUser }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id, data: { type: 'Request', request: props.request } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const req = props.request;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="glass-card"
      style={{
        padding: '1rem',
        marginBottom: '0.5rem',
        cursor: 'grab',
        border: '1px solid var(--glass-border)',
        ...style
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>#{req.id}</span>
        <span className={`badge ${req.priority.toLowerCase()}`}>{req.priority}</span>
      </div>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{req.title}</h3>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
        {req.user.name}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
        Category: {req.category}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Status: <span style={{ padding: "0.1rem 0.4rem", borderRadius: "4px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--glass-border)" }}>{req.status}</span>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {req.status === 'Resolved' || req.status === 'Closed' ? (
          <>Completed: {req.completedAt ? new Date(req.completedAt).toLocaleDateString() : 'N/A'}</>
        ) : (
          <>Created: {new Date(req.createdAt).toLocaleDateString()}</>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TimerButton id={req.id} isRunning={!!req.timerStartedAt} timeSpent={req.timeSpent} timerStartedAt={req.timerStartedAt} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href={`/requests/${req.id}`} onPointerDown={(e) => e.stopPropagation()} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '20px' }}>View</a>
          <a href={`/requests/${req.id}/edit`} onPointerDown={(e) => e.stopPropagation()} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '20px' }}>Edit</a>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => { if(confirm('Delete this request?')) fetch(`/api/requests/${req.id}`, { method: 'DELETE' }).then(() => window.location.reload()) }} className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(220, 38, 38, 0.2)', color: '#ef4444', border: '1px solid rgba(220, 38, 38, 0.5)', borderRadius: '20px' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ column, items }: { column: { id: string, title: string }; items: RequestWithUser[] }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(10, 10, 10, 0.8)',
        borderRadius: '8px',
        padding: '1rem',
        minHeight: '400px',
        maxHeight: 'calc(100vh - 250px)',
        overflowY: 'auto',
        border: '1px solid var(--glass-border)',
      }}
    >
      <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>{column.title} <span style={{ fontSize: '0.85rem', float: 'right' }}>{items.length}</span></h2>
      <div ref={setNodeRef} style={{ flex: 1 }}>
        <SortableContext
          items={items.map((i) => i.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {items.map((req) => (
            <SortableItem key={req.id} id={req.id.toString()} request={req} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

const priorityWeight = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Normal: 2,
  Low: 1
};

export function sortRequests(a: RequestWithUser, b: RequestWithUser) {
  const dateA = a.requiredByDate ? new Date(a.requiredByDate).getTime() : Infinity;
  const dateB = b.requiredByDate ? new Date(b.requiredByDate).getTime() : Infinity;
  
  if (dateA !== dateB) {
    return dateA - dateB;
  }
  
  const pA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
  const pB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
  
  return pB - pA;
}

export default function AdminKanbanClient({ requests }: { requests: RequestWithUser[] }) {
  const [items, setItems] = useState(requests);
  const [activeId, setActiveId] = useState<string | null>(null);

  React.useEffect(() => {
    // Silently run auto-archive job in the background
    fetch("/api/admin/archive").catch(err => console.error("Archive job failed:", err));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Request';
    const isOverTask = over.data.current?.type === 'Request';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setItems((items) => {
        const activeIndex = items.findIndex((t) => t.id.toString() === activeId);
        const overIndex = items.findIndex((t) => t.id.toString() === overId);

        if (items[activeIndex].status !== items[overIndex].status) {
          const newItems = [...items];
          newItems[activeIndex].status = items[overIndex].status;
          return arrayMove(newItems, activeIndex, overIndex);
        }

        return arrayMove(items, activeIndex, overIndex);
      });
    }

    if (isActiveTask && isOverColumn) {
      setItems((items) => {
        const activeIndex = items.findIndex((t) => t.id.toString() === activeId);
        const newItems = [...items];
        if (overId === 'Urgent') {
          newItems[activeIndex].priority = 'Urgent';
          newItems[activeIndex].status = 'Open';
        } else {
          newItems[activeIndex].status = overId;
        }
        return arrayMove(newItems, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeReqId = parseInt(active.id as string);
    const item = items.find((i) => i.id === activeReqId);
    
    if (item) {
      // Optimistic update in UI is already done by dragOver, just sync to DB
      try {
        await fetch(`/api/requests/${activeReqId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: item.status, priority: item.priority }),
        });
      } catch (e) {
        console.error("Failed to update status", e);
      }
    }
  };

  const activeRequest = items.find((i) => i.id.toString() === activeId);

  return (
    <DndContext
      id="admin-kanban"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', height: 'calc(100vh - 250px)' }}>
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            items={items.filter((i) => {
              if (col.id === 'Urgent') return i.priority === 'Urgent' && i.status === 'Open';
              if (col.id === 'Open') return i.status === 'Open' && i.priority !== 'Urgent';
              if (col.id === 'Resolved') return i.status === 'Resolved' || i.status === 'Closed';
              return i.status === col.id;
            }).sort(sortRequests)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeRequest ? <SortableItem id={activeRequest.id.toString()} request={activeRequest} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
