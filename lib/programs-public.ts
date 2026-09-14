import { and, asc, eq, ilike, inArray, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import {
  programCountries,
  programLevels,
  programs,
  type ProgramCountry,
  type ProgramLevel,
  type TuitionCurrency,
} from "@/db/schema";

export const publicProgramCountries = programCountries;
export const publicProgramLevels = programLevels;

export const PROGRAMS_CACHE_TAG = "programs";
export const PUBLIC_PROGRAM_PAGE_SIZE = 12;
export const PROGRAMS_REVALIDATE_SECONDS = 3600;

const countryAliases: Record<string, ProgramCountry> = {
  china: "china",
  india: "india",
  malaysia: "malaysia",
  south_korea: "south_korea",
  "south-korea": "south_korea",
};

export type PublicProgramFilters = {
  country: ProgramCountry | "";
  level: ProgramLevel | "";
  field: string;
  page: number;
};

export type PublicProgramCard = {
  id: string;
  universityName: string;
  country: ProgramCountry;
  level: ProgramLevel;
  field: string;
  tuitionAmount: string;
  tuitionCurrency: string;
  intakeMonths: string[] | null;
};

export type PublicProgramDetail = PublicProgramCard & {
  requirements: string | null;
  scholarshipInfo: string | null;
};

export type PublicProgramList = {
  rows: PublicProgramCard[];
  total: number;
  page: number;
  pageCount: number;
};

export function parsePublicCountry(
  value: string | undefined,
): ProgramCountry | "" {
  if (!value) {
    return "";
  }

  return countryAliases[value] ?? "";
}

export function parsePublicLevel(value: string | undefined): ProgramLevel | "" {
  if (!value) {
    return "";
  }

  const match = programLevels.find((level) => level === value);
  return match ?? "";
}

export function parsePublicProgramFilters(input: {
  country?: string;
  level?: string;
  field?: string;
  page?: string;
}): PublicProgramFilters {
  const page = Number.parseInt(input.page ?? "1", 10);

  return {
    country: parsePublicCountry(input.country),
    level: parsePublicLevel(input.level),
    field: (input.field ?? "").trim().slice(0, 200),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

function likePattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, "")}%`;
}

function publishedWhere(filters: PublicProgramFilters) {
  const conditions = [eq(programs.isPublished, true)];

  if (filters.country) {
    conditions.push(eq(programs.country, filters.country));
  }

  if (filters.level) {
    conditions.push(eq(programs.level, filters.level));
  }

  if (filters.field) {
    conditions.push(ilike(programs.field, likePattern(filters.field)));
  }

  return and(...conditions);
}

const cardColumns = {
  id: programs.id,
  universityName: programs.universityName,
  country: programs.country,
  level: programs.level,
  field: programs.field,
  tuitionAmount: programs.tuitionAmount,
  tuitionCurrency: programs.tuitionCurrency,
  intakeMonths: programs.intakeMonths,
};

async function queryPublishedProgramPage(
  filters: PublicProgramFilters,
): Promise<PublicProgramList> {
  const where = publishedWhere(filters);
  const offset = (filters.page - 1) * PUBLIC_PROGRAM_PAGE_SIZE;

  const [rows, countRows] = await Promise.all([
    db
      .select(cardColumns)
      .from(programs)
      .where(where)
      .orderBy(asc(programs.universityName), asc(programs.field))
      .limit(PUBLIC_PROGRAM_PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(programs)
      .where(where),
  ]);

  const total = countRows[0]?.total ?? 0;

  return {
    rows,
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / PUBLIC_PROGRAM_PAGE_SIZE)),
  };
}

export function getPublishedProgramPage(filters: PublicProgramFilters) {
  return unstable_cache(
    () => queryPublishedProgramPage(filters),
    [
      "published-program-page",
      filters.country,
      filters.level,
      filters.field,
      String(filters.page),
    ],
    {
      tags: [PROGRAMS_CACHE_TAG],
      revalidate: PROGRAMS_REVALIDATE_SECONDS,
    },
  )();
}

async function queryPublishedProgramDetail(
  id: string,
): Promise<PublicProgramDetail | null> {
  const [row] = await db
    .select({
      ...cardColumns,
      requirements: programs.requirements,
      scholarshipInfo: programs.scholarshipInfo,
    })
    .from(programs)
    .where(and(eq(programs.id, id), eq(programs.isPublished, true)))
    .limit(1);

  return row ?? null;
}

export function getPublishedProgramDetail(id: string) {
  return unstable_cache(
    () => queryPublishedProgramDetail(id),
    ["published-program-detail", id],
    {
      tags: [PROGRAMS_CACHE_TAG],
      revalidate: PROGRAMS_REVALIDATE_SECONDS,
    },
  )();
}

async function queryPublishedProgramsByUniversity(
  universityName: string,
  excludeId?: string,
  limit: number = 8,
): Promise<PublicProgramCard[]> {
  const conditions = [
    eq(programs.universityName, universityName),
    eq(programs.isPublished, true),
  ];

  if (excludeId) {
    conditions.push(sql`${programs.id} != ${excludeId}`);
  }

  return db
    .select(cardColumns)
    .from(programs)
    .where(and(...conditions))
    .orderBy(asc(programs.field))
    .limit(limit);
}

export function getPublishedProgramsByUniversity(
  universityName: string,
  excludeId?: string,
  limit: number = 8,
) {
  return unstable_cache(
    () => queryPublishedProgramsByUniversity(universityName, excludeId, limit),
    [
      "published-programs-by-university",
      universityName,
      excludeId ?? "",
      String(limit),
    ],
    {
      tags: [PROGRAMS_CACHE_TAG],
      revalidate: PROGRAMS_REVALIDATE_SECONDS,
    },
  )();
}

async function queryPublishedProgramsByIds(
  ids: string[],
): Promise<PublicProgramDetail[]> {
  if (ids.length === 0) {
    return [];
  }

  const rows = await db
    .select({
      ...cardColumns,
      requirements: programs.requirements,
      scholarshipInfo: programs.scholarshipInfo,
    })
    .from(programs)
    .where(and(eq(programs.isPublished, true), inArray(programs.id, ids)));

  const byId = new Map(rows.map((row) => [row.id, row]));
  const ordered: PublicProgramDetail[] = [];

  for (const id of ids) {
    const row = byId.get(id);
    if (row) {
      ordered.push(row);
    }
  }

  return ordered;
}

export function getPublishedProgramsByIds(ids: readonly string[]) {
  const requested = [...ids];

  return unstable_cache(
    () => queryPublishedProgramsByIds(requested),
    ["published-programs-compare", requested.join(",")],
    {
      tags: [PROGRAMS_CACHE_TAG],
      revalidate: PROGRAMS_REVALIDATE_SECONDS,
    },
  )();
}

export function listPublishedProgramIds() {
  return unstable_cache(
    async () => {
      const rows = await db
        .select({ id: programs.id })
        .from(programs)
        .where(eq(programs.isPublished, true));

      return rows.map((row) => row.id);
    },
    ["published-program-ids"],
    {
      tags: [PROGRAMS_CACHE_TAG],
      revalidate: PROGRAMS_REVALIDATE_SECONDS,
    },
  )();
}

export type PublishedProgramSitemapRow = {
  id: string;
  updatedAt: Date | null;
};

export function listPublishedProgramsForSitemap() {
  return unstable_cache(
    async (): Promise<PublishedProgramSitemapRow[]> => {
      return db
        .select({
          id: programs.id,
          updatedAt: programs.updatedAt,
        })
        .from(programs)
        .where(eq(programs.isPublished, true));
    },
    ["published-program-sitemap"],
    {
      tags: [PROGRAMS_CACHE_TAG],
      revalidate: PROGRAMS_REVALIDATE_SECONDS,
    },
  )();
}

export type CostCalculatorProgramOption = {
  id: string;
  universityName: string;
  field: string;
  level: ProgramLevel;
  tuitionAmount: string;
  tuitionCurrency: TuitionCurrency;
};

const COST_CALCULATOR_PROGRAM_CAP = 80;

async function queryPublishedProgramsForCostCalculator(
  country: ProgramCountry,
  level: ProgramLevel | "",
): Promise<CostCalculatorProgramOption[]> {
  const where = publishedWhere({
    country,
    level,
    field: "",
    page: 1,
  });

  return db
    .select({
      id: programs.id,
      universityName: programs.universityName,
      field: programs.field,
      level: programs.level,
      tuitionAmount: programs.tuitionAmount,
      tuitionCurrency: programs.tuitionCurrency,
    })
    .from(programs)
    .where(where)
    .orderBy(asc(programs.universityName), asc(programs.field))
    .limit(COST_CALCULATOR_PROGRAM_CAP);
}

export function listPublishedProgramsForCostCalculator(
  country: ProgramCountry,
  level: ProgramLevel | "",
) {
  return unstable_cache(
    () => queryPublishedProgramsForCostCalculator(country, level),
    ["cost-calculator-programs", country, level],
    {
      tags: [PROGRAMS_CACHE_TAG],
      revalidate: PROGRAMS_REVALIDATE_SECONDS,
    },
  )();
}
