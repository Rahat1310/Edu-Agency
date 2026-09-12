"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
} from "react";

import { moveLeadStage } from "@/app/admin/pipeline/actions";
import { useDeskToast } from "@/components/desk/toast";
import type { LeadStatus } from "@/db/schema";
import { useDeskMotion } from "@/lib/desk/motion";
import { pipelineKeyboardCoordinates } from "@/lib/desk/pipeline-keyboard";
import {
  formatDaysInStage,
  leadDestinationLabels,
  leadStatusLabels,
  leadStatusOptions,
} from "@/lib/leads/labels";
import type { PipelineBoardData, PipelineCard } from "@/lib/leads/pipeline-types";
import { cn } from "@/lib/utils";

type PipelineBoardProps = {
  board: PipelineBoardData;
  selectedLeadId?: string;
};

export function PipelineBoard({ board, selectedLeadId }: PipelineBoardProps) {
  const { toast } = useDeskToast();
  const { reduce, panel } = useDeskMotion();
  const [cards, setCards] = useState(board.cards);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [simulateFail, setSimulateFail] = useState(false);

  useEffect(() => {
    setCards(board.cards);
  }, [board.cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: pipelineKeyboardCoordinates,
    }),
  );

  const activeCard = useMemo(
    () => cards.find((card) => card.id === activeId) ?? null,
    [activeId, cards],
  );

  async function commitMove(card: PipelineCard, toStatus: LeadStatus) {
    if (card.status === toStatus || pendingIds.includes(card.id)) {
      return;
    }

    const previous = card;
    const next: PipelineCard = {
      ...card,
      status: toStatus,
      stageEnteredAt: new Date().toISOString(),
      daysInStage: 0,
    };

    setPendingIds((current) => [...current, card.id]);
    setCards((current) =>
      current.map((item) => (item.id === card.id ? next : item)),
    );

    const result = await moveLeadStage({
      leadId: card.id,
      fromStatus: card.status,
      toStatus,
      forceFail: simulateFail || undefined,
    });

    setPendingIds((current) => current.filter((id) => id !== card.id));

    if (!result.ok) {
      setCards((current) =>
        current.map((item) => (item.id === card.id ? previous : item)),
      );
      toast({
        title: "Move not saved",
        description: result.message,
        tone: "warn",
      });
    }
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const overId = event.over?.id;
    const card = cards.find((item) => item.id === String(event.active.id));
    setActiveId(null);

    if (!card || overId == null) {
      return;
    }

    const toStatus = String(overId);
    if (!isLeadStatus(toStatus)) {
      return;
    }

    void commitMove(card, toStatus);
  }

  function onDragCancel() {
    setActiveId(null);
  }

  return (
    <div className="space-y-3">
      <p className="text-[0.75rem] text-[var(--desk-ink-muted)]">
        Drag a card by its handle, or use the stage menu. Keyboard: focus the
        handle, Space to pick up, Left/Right to change stage, Space to drop.
      </p>
      {process.env.NODE_ENV !== "production" ? (
        <label className="flex items-center gap-2 text-[0.75rem] text-[var(--desk-ink-muted)]">
          <input
            type="checkbox"
            className="desk-focus size-3.5 accent-[var(--desk-accent)]"
            checked={simulateFail}
            onChange={(event) => setSimulateFail(event.target.checked)}
          />
          Simulate failed save
        </label>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              "To move a lead with the keyboard, tab to its move handle and press Space. Then use the Left and Right arrows to choose a stage, and Space to drop. You can also change stage with the menu on the card.",
          },
          announcements: {
            onDragStart({ active }) {
              const card = cards.find((item) => item.id === String(active.id));
              return `Picked up ${card?.name ?? "lead"}. Use left and right arrows to choose a stage, then space to drop.`;
            },
            onDragOver({ over }) {
              if (!over || !isLeadStatus(String(over.id))) {
                return;
              }
              return `Over ${leadStatusLabels[String(over.id) as LeadStatus]}`;
            },
            onDragEnd({ over }) {
              if (!over || !isLeadStatus(String(over.id))) {
                return "Move cancelled.";
              }
              return `Moved to ${leadStatusLabels[String(over.id) as LeadStatus]}.`;
            },
            onDragCancel() {
              return "Move cancelled.";
            },
          },
        }}
      >
        <div className="flex min-h-[calc(100svh-11rem)] gap-2 overflow-x-auto pb-1">
          {leadStatusOptions.map((status) => (
            <PipelineColumn
              key={status}
              status={status}
              cards={cards.filter((card) => card.status === status)}
              hiddenCount={board.hiddenByStatus[status] ?? 0}
              activeId={activeId}
              pendingIds={pendingIds}
              selectedLeadId={selectedLeadId}
              reduce={reduce}
              transition={panel}
              onStatusChange={commitMove}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <div data-surface="desk">
              <PipelineCardFace card={activeCard} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function PipelineColumn({
  status,
  cards,
  hiddenCount,
  activeId,
  pendingIds,
  selectedLeadId,
  reduce,
  transition,
  onStatusChange,
}: {
  status: LeadStatus;
  cards: PipelineCard[];
  hiddenCount: number;
  activeId: string | null;
  pendingIds: string[];
  selectedLeadId?: string;
  reduce: boolean;
  transition: ReturnType<typeof useDeskMotion>["panel"];
  onStatusChange: (card: PipelineCard, status: LeadStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[15.5rem] shrink-0 flex-col rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)]",
        isOver && "ring-2 ring-[var(--desk-accent-2)]",
      )}
    >
      <header className="flex items-baseline justify-between gap-2 border-b border-[var(--desk-line)] px-2.5 py-2">
        <h2 className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          {leadStatusLabels[status]}
        </h2>
        <p className="tabular-nums text-[0.68rem] text-[var(--desk-ink-muted)]">
          {cards.length + hiddenCount}
        </p>
      </header>
      <div className="flex min-h-40 flex-1 flex-col gap-2 overflow-y-auto p-2">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            layout={!reduce && activeId !== card.id}
            initial={false}
            animate={
              reduce
                ? { opacity: 1, y: 0 }
                : { opacity: activeId === card.id ? 0 : 1, y: 0 }
            }
            transition={transition}
          >
            <PipelineCardItem
              card={card}
              pending={pendingIds.includes(card.id)}
              selected={selectedLeadId === card.id}
              onStatusChange={onStatusChange}
            />
          </motion.div>
        ))}
        {hiddenCount > 0 ? (
          <Link
            href={`/admin/leads?status=${status}`}
            className="desk-focus rounded-[var(--desk-radius)] px-1 py-1 text-center text-[0.7rem] font-semibold text-[var(--desk-accent-2)]"
          >
            +{hiddenCount} more on the list
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function PipelineCardItem({
  card,
  pending,
  selected,
  onStatusChange,
}: {
  card: PipelineCard;
  pending: boolean;
  selected: boolean;
  onStatusChange: (card: PipelineCard, status: LeadStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      disabled: pending,
    });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(isDragging && "opacity-0")}
    >
      <PipelineCardFace
        card={card}
        pending={pending}
        selected={selected}
        onStatusChange={onStatusChange}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </div>
  );
}

function PipelineCardFace({
  card,
  overlay = false,
  pending = false,
  selected = false,
  onStatusChange,
  dragHandleProps,
}: {
  card: PipelineCard;
  overlay?: boolean;
  pending?: boolean;
  selected?: boolean;
  onStatusChange?: (card: PipelineCard, status: LeadStatus) => void;
  dragHandleProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <article
      className={cn(
        "rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] p-2 shadow-sm",
        overlay && "shadow-md",
        pending && "opacity-70",
        selected &&
          "border-[var(--desk-accent-2)] ring-1 ring-[var(--desk-accent-2)]",
      )}
    >
      <div className="flex items-start gap-1">
        {dragHandleProps ? (
          <button
            type="button"
            className="desk-focus desk-press mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--desk-radius)] text-[var(--desk-ink-muted)]"
            aria-label={`Pick up ${card.name} to change stage`}
            disabled={pending}
            {...dragHandleProps}
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </button>
        ) : null}
        <p className="min-w-0 flex-1 text-sm font-semibold text-[var(--desk-ink)]">
          {overlay ? (
            card.name
          ) : (
            <Link
              href={`/admin/pipeline?lead=${card.id}`}
              className="desk-focus rounded-[var(--desk-radius)] hover:text-[var(--desk-accent-2)]"
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              {card.name}
            </Link>
          )}
        </p>
      </div>
      <p
        className={cn(
          "mt-0.5 text-[0.7rem] text-[var(--desk-ink-muted)]",
          dragHandleProps && "pl-8",
        )}
      >
        {leadDestinationLabels[card.destinationInterest]}
        <span className="mx-1" aria-hidden="true">
          ·
        </span>
        {formatDaysInStage(card.daysInStage)}
      </p>
      {onStatusChange ? (
        <label
          className={cn(
            "mt-2 block text-[0.65rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase",
            dragHandleProps && "pl-8",
          )}
        >
          Stage
          <select
            value={card.status}
            disabled={pending}
            aria-label={`Move ${card.name} to stage`}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            onChange={(event) => {
              const value = event.target.value;
              if (isLeadStatus(value)) {
                onStatusChange(card, value);
              }
            }}
            className="desk-focus mt-1 h-7 w-full rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] px-1.5 text-xs font-normal text-[var(--desk-ink)] normal-case"
          >
            {leadStatusOptions.map((status) => (
              <option key={status} value={status}>
                {leadStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </article>
  );
}

function isLeadStatus(value: string): value is LeadStatus {
  return leadStatusOptions.some((status) => status === value);
}
