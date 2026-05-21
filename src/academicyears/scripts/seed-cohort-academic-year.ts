import * as dotenv from "dotenv";
import { Client } from "pg";
import * as path from "path";

// ─── Load environment variables ──────────────────────────────────────────────
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

interface CohortRow {
  cohortId: string;
  tenantId: string;
  status: string;
}

interface AcademicYearRow {
  id: string;
  tenantId: string;
}

interface ExistingMapping {
  cohortId: string;
  academicYearId: string;
}

async function main() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT) || 5432,
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
  });

  try {
    await client.connect();
    console.log("✅ Connected to the database.\n");

    // ── Step 1: Fetch cohorts with filters for tenantId and status ───────────
    const cohortResult = await client.query<CohortRow>(
      `SELECT "cohortId", "tenantId", "status"
       FROM public."Cohort"
       WHERE "tenantId" = 'ef99949b-7f3a-4a5f-806a-e67e683e38f3'
         AND "status" = 'active'`
    );
    const cohorts = cohortResult.rows;
    console.log(`📋 Fetched ${cohorts.length} cohort(s) from the Cohort table (filtered by tenantId and active status).`);

    if (cohorts.length === 0) {
      console.log("⚠️ No cohorts found matching the filters. Nothing to process.");
      return;
    }

    // ── Step 2: Fetch active academic years for the target tenant ────────────
    const academicYearResult = await client.query<AcademicYearRow>(
      `SELECT "id", "tenantId"
       FROM public."AcademicYears"
       WHERE "isActive" = true
         AND "tenantId" = 'ef99949b-7f3a-4a5f-806a-e67e683e38f3'`
    );
    const academicYears = academicYearResult.rows;
    console.log(`📅 Fetched ${academicYears.length} active academic year(s) for the target tenant.\n`);

    // Build a lookup: tenantId → academicYearId
    const tenantToAcademicYear = new Map<string, string>();
    for (const ay of academicYears) {
      tenantToAcademicYear.set(ay.tenantId, ay.id);
    }

    // ── Step 3: Fetch existing mappings to avoid duplicates ──────────────────
    const existingResult = await client.query<ExistingMapping>(
      `SELECT "cohortId", "academicYearId" FROM public."CohortAcademicYear"`
    );
    const existingSet = new Set(
      existingResult.rows.map((r) => `${r.cohortId}::${r.academicYearId}`)
    );

    // ── Step 4: Build mapping list ───────────────────────────────────────────
    const toInsert: { cohortId: string; academicYearId: string; status: string; tenantId: string }[] = [];
    let skippedNoAcademicYear = 0;
    let skippedDuplicate = 0;

    for (const cohort of cohorts) {
      const academicYearId = tenantToAcademicYear.get(cohort.tenantId);

      if (!academicYearId) {
        skippedNoAcademicYear++;
        continue;
      }

      const key = `${cohort.cohortId}::${academicYearId}`;
      if (existingSet.has(key)) {
        skippedDuplicate++;
        continue;
      }

      toInsert.push({
        cohortId: cohort.cohortId,
        academicYearId,
        status: cohort.status,
        tenantId: cohort.tenantId
      });
    }

    console.log(`📊 Summary of mapped cohorts:`);
    console.log(`    • Mapped cohorts (would insert) : ${toInsert.length}`);
    console.log(`    • Skipped (no active AY)        : ${skippedNoAcademicYear}`);
    console.log(`    • Skipped (already exists)      : ${skippedDuplicate}\n`);

    if (toInsert.length === 0) {
      console.log("✅ Nothing new to insert or map.");
      return;
    }

    console.log("🔍 Proposed Mapping Details (DRY RUN - NOT PUSHED TO DB):");
    console.table(toInsert);

    // ── Step 5: (DRY RUN - PUSHING TO DB IS DISABLED) ────────────────────────
    console.log("\nℹ️ Database insertion is currently disabled as requested. Set dryRun = false to enable.");

  } catch (error) {
    console.error("❌ Error running seed script:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("🔌 Database connection closed.");
  }
}

main();
