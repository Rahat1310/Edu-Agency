import Link from "next/link";

import { createSuccessStory } from "@/app/admin/success-stories/actions";
import { SuccessStoryForm } from "@/components/admin/success-story-form";

export default async function NewSuccessStoryPage() {
  return (
    <div className="max-w-3xl">
      <p className="font-utility text-[0.68rem] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
        New story
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
        Add a success story
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Saved as unpublished. Use the list toggle when it is ready to appear on
        /success-stories and the home page.
      </p>
      <p className="mt-4">
        <Link
          href="/admin/success-stories"
          className="focus-ring rounded-md text-sm font-bold text-[var(--brand-blue)]"
        >
          Back to success stories
        </Link>
      </p>
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-8">
        <SuccessStoryForm
          submitLabel="Create story"
          onSubmitAction={createSuccessStory}
        />
      </div>
    </div>
  );
}
