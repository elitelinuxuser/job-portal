import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

// Load environment variables FIRST before anything else
config({ path: resolve(process.cwd(), ".env.local") });

async function fixVerificationEnum() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in .env.local");
  }

  const sql = postgres(process.env.DATABASE_URL, {
    ssl: "require",
  });

  try {
    console.log("Fixing verification_status enum...");

    // Step 0: Clean up any previous failed attempts
    console.log("Step 0: Cleaning up previous attempts...");
    await sql`DROP TYPE IF EXISTS verification_status_new;`;
    console.log("✅ Cleanup complete");

    // Step 1: Create new enum type with correct values
    console.log("Step 1: Creating new enum type...");
    await sql`
      CREATE TYPE verification_status_new AS ENUM ('pending', 'verified', 'rejected');
    `;
    console.log("✅ New enum type created");

    // Step 2: Drop default values from company_profiles
    console.log("Step 2: Dropping default from company_profiles...");
    await sql`
      ALTER TABLE company_profiles 
        ALTER COLUMN verification_status DROP DEFAULT;
    `;
    console.log("✅ Default dropped from company_profiles");

    // Step 3: Drop default values from freelancer_profiles
    console.log("Step 3: Dropping default from freelancer_profiles...");
    await sql`
      ALTER TABLE freelancer_profiles 
        ALTER COLUMN verification_status DROP DEFAULT;
    `;
    console.log("✅ Default dropped from freelancer_profiles");

    // Step 4: Alter company_profiles table to use new enum
    console.log("Step 4: Updating company_profiles column type...");
    await sql`
      ALTER TABLE company_profiles 
        ALTER COLUMN verification_status TYPE verification_status_new 
        USING verification_status::text::verification_status_new;
    `;
    console.log("✅ company_profiles column type updated");

    // Step 5: Alter freelancer_profiles table to use new enum
    console.log("Step 5: Updating freelancer_profiles column type...");
    await sql`
      ALTER TABLE freelancer_profiles 
        ALTER COLUMN verification_status TYPE verification_status_new 
        USING verification_status::text::verification_status_new;
    `;
    console.log("✅ freelancer_profiles column type updated");

    // Step 6: Drop old enum type
    console.log("Step 6: Dropping old enum type...");
    await sql`DROP TYPE verification_status;`;
    console.log("✅ Old enum type dropped");

    // Step 7: Rename new enum type to original name
    console.log("Step 7: Renaming new enum type...");
    await sql`ALTER TYPE verification_status_new RENAME TO verification_status;`;
    console.log("✅ Enum renamed");

    // Step 8: Re-add default values to company_profiles
    console.log("Step 8: Re-adding default to company_profiles...");
    await sql`
      ALTER TABLE company_profiles 
        ALTER COLUMN verification_status SET DEFAULT 'pending'::verification_status;
    `;
    console.log("✅ Default re-added to company_profiles");

    // Step 9: Re-add default values to freelancer_profiles
    console.log("Step 9: Re-adding default to freelancer_profiles...");
    await sql`
      ALTER TABLE freelancer_profiles 
        ALTER COLUMN verification_status SET DEFAULT 'pending'::verification_status;
    `;
    console.log("✅ Default re-added to freelancer_profiles");

    console.log(
      "\n✅ Migration complete! The verification_status enum now only has: pending, verified, rejected"
    );
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);

    // Try to clean up if we got partway through
    try {
      await sql`DROP TYPE IF EXISTS verification_status_new;`;
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    throw error;
  } finally {
    await sql.end();
  }
}

fixVerificationEnum()
  .then(() => {
    console.log("\n🎉 All done! You can now restart your server.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
