export function publishedVisaRequirements<
  T extends { isPublished: boolean; sortOrder: number },
>(rows: readonly T[]): T[] {
  return rows
    .filter((row) => row.isPublished)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
