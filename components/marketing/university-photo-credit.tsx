"use client";

import { Popover } from "radix-ui";
import { ExternalLink, Info } from "lucide-react";
import type { UniversityVisual } from "@/lib/university-visuals";
import styles from "./university-card.module.css";

export function UniversityPhotoCredit({ photo }: { photo?: UniversityVisual }) {
  if (!photo) return null;

  return (
    <Popover.Root>
      <Popover.Trigger
        className={styles.photoCredit}
        aria-label={`Photo credit: ${photo.credit}`}
      >
        <Info size={17} strokeWidth={1.5} aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={styles.creditPopover}
          sideOffset={8}
          collisionPadding={16}
        >
          <p>{photo.credit}</p>
          <div>
            <a href={photo.source} target="_blank" rel="noreferrer">
              Photo source <ExternalLink size={11} aria-hidden="true" />
            </a>
            {photo.license ? (
              <a href={photo.license} target="_blank" rel="noreferrer">
                {photo.licenseLabel ?? "License"}
              </a>
            ) : null}
          </div>
          <Popover.Arrow className={styles.creditArrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
