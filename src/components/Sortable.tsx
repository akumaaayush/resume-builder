import type { ReactNode } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/**
 * Vertical sortable list. Each list owns its own DndContext so nested lists
 * (sections > entries > bullets) never fight over a drag.
 */
export function SortableList({
  ids,
  onReorder,
  children,
}: {
  ids: string[]
  onReorder: (from: number, to: number) => void
  children: ReactNode
}) {
  const sensors = useSensors(
    // A small threshold keeps the handle clickable and lets text selection work.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    onReorder(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

/** Renders its child with a drag handle to place wherever it fits. */
export function SortableRow({
  id,
  className = '',
  children,
}: {
  id: string
  className?: string
  children: (handle: ReactNode) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      data-tip="Drag to reorder"
      className="shrink-0 cursor-grab rounded px-1 py-1 text-base leading-none text-dim transition hover:bg-ink/10 hover:text-ink active:cursor-grabbing"
    >
      ⠿
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${isDragging ? 'relative z-10 opacity-70' : ''} ${className}`}
    >
      {children(handle)}
    </div>
  )
}
