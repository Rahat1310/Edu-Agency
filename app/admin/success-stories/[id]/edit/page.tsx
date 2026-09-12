import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { updateSuccessStory } from "@/app/admin/success-stories/actions";
import { SuccessStoryForm } from "@/components/admin/success-story-form";
import { db } from "@/db";
import { successStories } from "@/db/schema";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSuccessStoryPage({ params }: PageProps) {
  const { id } = await params;
  const [story] = await db
    .select()
    .from(successStories)
    .where(eq(successStories.id, id))
    .limit(1);

  if (!story) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <p className="font-utility text-[0.68rem] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
        Edit story
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
        {story.studentName}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Publishing is controlled from the stories list, not this form.
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
          defaultValues={{
            studentName: story.studentName,
            destination: story.destination,
            university: story.university,
            program: story.program,
            quote: story.quote,
            photoR2Key: story.photoR2Key ?? "",
          }}
          submitLabel="Save changes"
          onSubmitAction={updateSuccessStory.bind(null, story.id)}
        />
      </div>
    </div>
  );
}
