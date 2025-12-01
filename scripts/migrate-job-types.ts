import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

async function runMigration() {
  const client = postgres(process.env.DATABASE_URL!, {
    ssl: "require",
    max: 1,
  });

  try {
    console.log("Starting job_type migration...");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "../drizzle/0005_stale_apocalypse.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    // Split by statement-breakpoint and execute each statement
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    for (const statement of statements) {
      console.log("\nExecuting:", statement.substring(0, 100) + "...");
      await client.unsafe(statement);
      console.log("✓ Success");
    }

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration();
