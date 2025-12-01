import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

// Load environment variables FIRST before anything else
config({ path: resolve(process.cwd(), ".env.local") });

async function migrateUnverifiedToRejected() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in .env.local");
  }

  const sql = postgres(process.env.DATABASE_URL, {
    ssl: "require",
  });

  try {
    console.log("Starting migration: unverified -> rejected...");

    // Update company profiles
    console.log("Updating company profiles...");
    const companyResult = await sql`
      UPDATE company_profiles 
      SET verification_status = 'rejected', updated_at = NOW() 
      WHERE verification_status = 'unverified';
    `;
    console.log(`✅ Updated ${companyResult.count} company profiles`);

    // Update freelancer profiles
    console.log("Updating freelancer profiles...");
    const freelancerResult = await sql`
      UPDATE freelancer_profiles 
      SET verification_status = 'rejected', updated_at = NOW() 
      WHERE verification_status = 'unverified';
    `;
    console.log(`✅ Updated ${freelancerResult.count} freelancer profiles`);

    console.log("\n✅ Migration complete!");
    console.log(
      "Next step: Run `npx drizzle-kit push` to update the database schema"
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

migrateUnverifiedToRejected()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
