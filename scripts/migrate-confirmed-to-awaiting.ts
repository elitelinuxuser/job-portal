import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Data migration script to update existing payment records
 * from 'confirmed' status to 'awaiting_confirmation' status
 *
 * NOTE: This should be run BEFORE the schema migration (0009_workable_maginty.sql)
 * to ensure no data is lost during the enum type change.
 */
async function migrateConfirmedToAwaiting() {
  console.log(
    "Starting migration of confirmed payments to awaiting_confirmation..."
  );

  try {
    // Update all payments with 'confirmed' status to 'paid' status
    // This is because in the new workflow:
    // - 'confirmed' meant the freelancer confirmed receipt (final state)
    // - 'paid' now means the payment is complete (final state)
    const result = await db
      .update(payments)
      .set({
        status: "paid" as any, // Using 'any' to bypass type checking since we're migrating
      })
      .where(eq(payments.status, "confirmed" as any))
      .returning();

    console.log(
      `✓ Successfully migrated ${result.length} payment(s) from 'confirmed' to 'paid' status`
    );

    // Display migrated records
    if (result.length > 0) {
      console.log("\nMigrated payments:");
      result.forEach((payment, index) => {
        console.log(
          `  ${index + 1}. Payment ID: ${payment.id} - Amount: ₹${
            payment.amount
          }`
        );
      });
    }

    console.log("\nMigration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateConfirmedToAwaiting();
