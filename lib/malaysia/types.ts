/** Student-facing catalogue only. Originals and ingestion audit stay in imports/. */
export type MalaysiaSourceRef = {
  id: string;
  page: string;
  title: string;
  period: string;
};
export type MalaysiaTable = {
  caption: string;
  headers: string[];
  rows: string[][];
};
export type MalaysiaSchedule = {
  id: string;
  label: string;
  period: string;
  status: "historical" | "confirmation-required";
  audience: string;
  refs: MalaysiaSourceRef[];
  tables: MalaysiaTable[];
  terms: string[];
};
export type MalaysiaProgramme = {
  id: string;
  identityKey: string;
  institutionId: string;
  title: string;
  code: string | null;
  provider: string | null;
  campus: string | null;
  level: string;
  mode: string | null;
  duration: string | null;
  intakes: string[];
  scheduleIds: string[];
  notes: string[];
};
export type MalaysiaInstitution = {
  id: string;
  name: string;
  aliases: string[];
  kind: "university" | "group" | "school" | "reference";
  notes: string[];
  links: { label: string; url: string }[];
};
export type MalaysiaCatalogue = {
  edition: string;
  institutions: MalaysiaInstitution[];
  programmes: MalaysiaProgramme[];
  schedules: MalaysiaSchedule[];
};
