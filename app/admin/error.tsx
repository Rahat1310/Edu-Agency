"use client";

import { DeskErrorState } from "@/components/desk/error-state";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ reset }: AdminErrorProps) {
  return (
    <DeskErrorState
      title="The desk could not load"
      body="Something went wrong while fetching this view. Your notes and stage changes are safe — try again."
      onRetry={reset}
    />
  );
}
