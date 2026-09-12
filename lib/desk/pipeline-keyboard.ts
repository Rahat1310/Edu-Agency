import {
  KeyboardCode,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";

import { leadStatusOptions } from "@/lib/leads/labels";

/**
 * Move a picked-up card one pipeline column per Left/Right arrow.
 * Space / Enter still drop via KeyboardSensor.
 */
export const pipelineKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates, context: { droppableRects } },
) => {
  const direction =
    event.code === KeyboardCode.Right
      ? 1
      : event.code === KeyboardCode.Left
        ? -1
        : 0;

  if (direction === 0) {
    return;
  }

  event.preventDefault();

  const columns = leadStatusOptions.flatMap((status) => {
    const rect = droppableRects.get(status);
    return rect ? [{ status, rect }] : [];
  });

  if (columns.length === 0) {
    return;
  }

  const currentIndex = columns.findIndex(
    ({ rect }) =>
      currentCoordinates.x >= rect.left && currentCoordinates.x <= rect.right,
  );

  const fallback = direction > 0 ? 0 : columns.length - 1;
  const nextIndex =
    currentIndex === -1
      ? fallback
      : Math.min(columns.length - 1, Math.max(0, currentIndex + direction));
  const next = columns[nextIndex];

  if (!next || nextIndex === currentIndex) {
    return;
  }

  return {
    x: next.rect.left + next.rect.width / 2,
    y: next.rect.top + Math.min(48, next.rect.height / 2),
  };
};
