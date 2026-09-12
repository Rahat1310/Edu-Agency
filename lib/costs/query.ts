import { z } from "zod";

import type { ProgramCountry, ProgramLevel } from "@/db/schema";
import { parsePublicCountry, parsePublicLevel } from "@/lib/programs-public";

export type CostCalculatorQuery = {
  destination: ProgramCountry | "";
  level: ProgramLevel | "";
  programId: string;
};

export function parseCostCalculatorQuery(input: {
  destination?: string;
  country?: string;
  level?: string;
  program?: string;
}): CostCalculatorQuery {
  const destination =
    parsePublicCountry(input.destination) || parsePublicCountry(input.country);

  const programParsed = z.string().uuid().safeParse(input.program?.trim());

  return {
    destination,
    level: parsePublicLevel(input.level),
    programId: programParsed.success ? programParsed.data : "",
  };
}
