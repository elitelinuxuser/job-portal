/**
 * Migration Script: Convert boolean contract fields to JSONB array
 *
 * This script migrates existing job_posts records from individual boolean
 * contract fields (contractSdCard, contractPaymentAfterShot, etc.) to the
 * new JSONB array format (contractTerms: ["sdCard", "paymentAfterShot", ...])
 *
 * Run with: npx tsx scripts/migrate-contract-terms.ts
 */

import "dotenv/config";
import { db } from "@/lib/db";
import { jobPosts } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

// Legacy field mapping reference (for documentation)
// contract_sd_card -> sdCard
// contract_payment_after_shot -> paymentAfterShot
// contract_transportation_allowance -> transportationAllowance
// contract_content_posting -> contentPosting
// contract_advance_payment -> advancePayment

async function migrateContractTerms() {
  console.log("Starting contract terms migration...");

  // Get all job posts
  const jobs = await db.query.jobPosts.findMany();

  console.log(`Found ${jobs.length} job posts to migrate`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const job of jobs) {
    // Skip if contractTerms is already populated
    if (
      job.contractTerms &&
      Array.isArray(job.contractTerms) &&
      job.contractTerms.length > 0
    ) {
      skippedCount++;
      continue;
    }

    // Build the new contractTerms array from legacy boolean fields
    const contractTerms: string[] = [];

    if (job.contractSdCard) {
      contractTerms.push("sdCard");
    }
    if (job.contractPaymentAfterShot) {
      contractTerms.push("paymentAfterShot");
    }
    if (job.contractTransportationAllowance) {
      contractTerms.push("transportationAllowance");
    }
    if (job.contractContentPosting) {
      contractTerms.push("contentPosting");
    }
    if (job.contractAdvancePayment) {
      contractTerms.push("advancePayment");
    }

    // Update the job post with the new contractTerms array
    await db
      .update(jobPosts)
      .set({
        contractTerms,
        updatedAt: new Date(),
      })
      .where(sql`${jobPosts.id} = ${job.id}`);

    migratedCount++;

    if (migratedCount % 100 === 0) {
      console.log(`Migrated ${migratedCount} jobs...`);
    }
  }

  console.log("\nMigration complete!");
  console.log(`- Migrated: ${migratedCount} jobs`);
  console.log(`- Skipped (already migrated): ${skippedCount} jobs`);
  console.log(`- Total: ${jobs.length} jobs`);
}

// Run the migration
migrateContractTerms()
  .then(() => {
    console.log("\nMigration finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
