export function sortThreadMessages<T extends { id: string; createdAt: string }>(
  rows: readonly T[],
): T[] {
  return [...rows].sort((left, right) => {
    const time = left.createdAt.localeCompare(right.createdAt);
    return time !== 0 ? time : left.id.localeCompare(right.id);
  });
}

export function sortAutomationEvents<T extends { id: string; sentAt: string }>(
  rows: readonly T[],
): T[] {
  return [...rows].sort((left, right) => {
    const time = left.sentAt.localeCompare(right.sentAt);
    return time !== 0 ? time : left.id.localeCompare(right.id);
  });
}
