import data from "./catalogue.json";
import retired from "./retired-mocks.json";
import type { MalaysiaCatalogue, MalaysiaProgramme } from "./types";
import type {
  PublicProgramDetail,
  PublicProgramFilters,
} from "@/lib/programs-public";
import type { ProgramLevel } from "@/db/schema";

export const malaysiaCatalogue = data as unknown as MalaysiaCatalogue;
export const malaysiaInstitutions = malaysiaCatalogue.institutions;
export const malaysiaProgrammes = malaysiaCatalogue.programmes;
export const malaysiaSchedules = malaysiaCatalogue.schedules;
export const retiredMalaysiaIds = retired.map((row) => row.id);
const byId = new Map(malaysiaProgrammes.map((p) => [p.id, p]));
export const getMalaysiaProgramme = (id: string) => byId.get(id);
export const getMalaysiaInstitution = (id: string) =>
  malaysiaInstitutions.find((i) => i.id === id);
export const getMalaysiaSchedules = (programme: MalaysiaProgramme) =>
  malaysiaSchedules.filter((s) => programme.scheduleIds.includes(s.id));
export const getMalaysiaSuccessor = (id: string) =>
  retired.find((r) => r.id === id)?.successor ?? null;

const sharedLevels = new Set([
  "foundation",
  "diploma",
  "bachelor",
  "master",
  "phd",
  "language",
]);
export function malaysiaProgrammeCard(
  p: MalaysiaProgramme,
): PublicProgramDetail {
  const institution = getMalaysiaInstitution(p.institutionId)!;
  return {
    id: p.id,
    universityName: institution.name,
    country: "malaysia",
    level: (sharedLevels.has(p.level) ? p.level : "foundation") as ProgramLevel,
    catalogueLevel: p.level,
    comparisonFeeDisplay: getMalaysiaSchedules(p)
      .map((s) =>
        [
          s.label,
          `${s.period} · ${s.status === "historical" ? "Historical" : "Confirm availability"}`,
          s.audience,
          ...s.tables
            .slice(0, 1)
            .flatMap((t) => [
              t.caption,
              ...t.rows.map((r) =>
                r
                  .map((value, i) => `${t.headers[i]}: ${value || "Unknown"}`)
                  .join(" · "),
              ),
            ]),
        ].join("\n"),
      )
      .join("\n\n"),
    field: p.title,
    tuitionAmount: "",
    tuitionCurrency: "MYR",
    tuitionDisplay:
      "See dated fee schedules · annual, semester and programme bases differ",
    intakeMonths: p.intakes,
    requirements: [p.provider, p.campus, p.mode, p.duration, ...p.notes]
      .filter(Boolean)
      .join("\n"),
    scholarshipInfo:
      "See the eligibility and period on each fee schedule. Current availability requires confirmation.",
  };
}
export function filterMalaysiaProgrammes(
  filters: Partial<PublicProgramFilters>,
) {
  if (filters.country && filters.country !== "malaysia") return [];
  // China-specific filters must not introduce unrelated Malaysia rows.
  if (
    filters.language ||
    filters.scholarship ||
    (filters.intake && filters.country !== "malaysia")
  )
    return [];
  const search = filters.field?.toLocaleLowerCase() ?? "";
  return malaysiaProgrammes.filter((p) => {
    const institution = getMalaysiaInstitution(p.institutionId)!;
    return (
      institution.kind !== "school" &&
      (!filters.level || p.level === filters.level) &&
      (!filters.university ||
        [institution.id, institution.name, ...institution.aliases].some(
          (name) =>
            name.toLowerCase().includes(filters.university!.toLowerCase()),
        )) &&
      (!filters.intake || p.intakes.includes(filters.intake)) &&
      (!search ||
        [
          p.title,
          p.code,
          p.provider,
          p.campus,
          institution.name,
          ...institution.aliases,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search))
    );
  });
}
