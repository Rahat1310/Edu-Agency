"use client";

import { DeskEmptyState } from "@/components/desk/empty-state";
import { PipelineBoard } from "@/components/desk/pipeline-board";
import {
  DeskPreviewBar,
  DeskPreviewError,
  useDeskPreview,
} from "@/components/desk/preview";
import { DeskBoardSkeleton } from "@/components/desk/skeleton";
import type { PipelineBoardData } from "@/lib/leads/pipeline-types";

type PipelineDeskProps = {
  board: PipelineBoardData;
  selectedLeadId?: string;
};

export function PipelineDesk({ board, selectedLeadId }: PipelineDeskProps) {
  const { preview, setPreview } = useDeskPreview();
  const empty = preview === "empty" || board.cards.length === 0;

  return (
    <div className="space-y-3">
      <DeskPreviewBar preview={preview} onChange={setPreview} />
      {preview === "error" ? (
        <DeskPreviewError onRetry={() => setPreview("off")} />
      ) : preview === "loading" ? (
        <DeskBoardSkeleton />
      ) : empty ? (
        <DeskEmptyState
          title="No leads on the board yet"
          body="Once your marketing site starts capturing them, they'll show up here. New enquiries land in the first column, and you can move them across the pipeline as the file progresses."
        />
      ) : (
        <PipelineBoard board={board} selectedLeadId={selectedLeadId} />
      )}
    </div>
  );
}
