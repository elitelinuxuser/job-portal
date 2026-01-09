import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  decimal,
  pgEnum,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "company",
  "freelancer",
]);
export const onboardingStatusEnum = pgEnum("onboarding_status", [
  "incomplete",
  "complete",
]);
export const jobResponseStatusEnum = pgEnum("job_response_status", [
  "interested",
  "not_interested",
]);
export const jobStatusEnum = pgEnum("job_status", [
  "active",
  "booked",
  "completed",
  "cancelled",
]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "accepted",
  "rejected",
  "completed",
]);
export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "verified",
  "rejected",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "awaiting_confirmation",
  "paid",
  "declined",
  "disputed",
]);
export const paymentModeEnum = pgEnum("payment_mode", [
  "cash",
  "upi",
  "net_banking",
]);
export const reportTypeEnum = pgEnum("report_type", [
  "job_post",
  "freelancer",
  "company",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "resolved",
  "dismissed",
]);
export const jobTypeEnum = pgEnum("job_type", [
  "candid_photographer",
  "cinematographer",
  "traditional_photographer",
  "traditional_videographer",
  "photo_editor",
  "video_editor",
  "drone",
]);

// Users table (synced from Clerk)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull(),
  onboardingStatus: onboardingStatusEnum("onboarding_status")
    .notNull()
    .default("incomplete"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Company profiles
export const companyProfiles = pgTable("company_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  companyName: text("company_name").notNull(),
  contactPersonName: text("contact_person_name").notNull(),
  whatsappNumber: varchar("whatsapp_number", { length: 15 }).notNull(),
  location: text("location").notNull(), // Based in
  startedIn: integer("started_in"), // Year
  logoUrl: text("logo_url"),
  proofOfOwnershipUrl: text("proof_of_ownership_url"),
  verificationStatus: verificationStatusEnum("verification_status")
    .notNull()
    .default("pending"),
  isActive: boolean("is_active").notNull().default(true),
  deactivatedAt: timestamp("deactivated_at"),
  deactivatedBy: text("deactivated_by").references(() => users.id),
  deactivationReason: text("deactivation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Freelancer profiles
export const freelancerProfiles = pgTable("freelancer_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  photoUrl: text("photo_url"),
  verificationStatus: verificationStatusEnum("verification_status")
    .notNull()
    .default("pending"),
  equipmentList: jsonb("equipment_list")
    .$type<string[]>()
    .notNull()
    .default([]),
  portfolioLinks: jsonb("portfolio_links")
    .$type<string[]>()
    .notNull()
    .default([]),
  whatsappNumber: varchar("whatsapp_number", { length: 15 }).notNull(),
  idProofUrl: text("id_proof_url"),
  isActive: boolean("is_active").notNull().default(true),
  deactivatedAt: timestamp("deactivated_at"),
  deactivatedBy: text("deactivated_by").references(() => users.id),
  deactivationReason: text("deactivation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Job posts (Company requirements)
export const jobPosts = pgTable("job_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dates: jsonb("dates")
    .$type<Array<{ date: string; startTime?: string; endTime?: string }>>()
    .notNull(),
  location: text("location").notNull(),

  // Structured location fields for Google Maps integration
  locationFormatted: text("location_formatted"),
  locationCity: text("location_city"),
  locationState: text("location_state"),
  locationCountry: text("location_country"),
  locationLatitude: decimal("location_latitude", { precision: 10, scale: 7 }),
  locationLongitude: decimal("location_longitude", { precision: 10, scale: 7 }),
  locationPlaceId: text("location_place_id"),

  budget: decimal("budget", { precision: 10, scale: 2 }),
  jobTypes: jobTypeEnum("job_types").array().notNull(),

  // Contract terms stored as JSONB array of term IDs (e.g., ["sdCard", "paymentAfterShot"])
  // See lib/constants/contract-terms.ts for available terms
  contractTerms: jsonb("contract_terms").$type<string[]>().default([]),
  contractAdditionalDetails: text("contract_additional_details"),

  // Legacy boolean fields - kept for backward compatibility during migration
  // TODO: Remove these after migration is complete
  contractContentPosting: boolean("contract_content_posting")
    .notNull()
    .default(false),
  contractAdvancePayment: boolean("contract_advance_payment")
    .notNull()
    .default(false),
  contractPaymentAfterShot: boolean("contract_payment_after_shot")
    .notNull()
    .default(false),
  contractContentOwnership: boolean("contract_content_ownership")
    .notNull()
    .default(false),
  contractSdCard: boolean("contract_sd_card").notNull().default(false),
  contractTransportationAllowance: boolean("contract_transportation_allowance")
    .notNull()
    .default(false),

  isActive: boolean("is_active").notNull().default(true),
  status: jobStatusEnum("status").notNull().default("active"),
  bookedFreelancerId: text("booked_freelancer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Job responses (Freelancer applications)
export const jobResponses = pgTable("job_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobPosts.id),
  freelancerId: text("freelancer_id")
    .notNull()
    .references(() => users.id),
  status: jobResponseStatusEnum("status").notNull(),
  message: text("message"),
  proposedPrice: decimal("proposed_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  viewedAt: timestamp("viewed_at"),
});

// Booking requests (Company sends to Freelancer)
export const bookingRequests = pgTable("booking_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobPosts.id),
  companyId: text("company_id")
    .notNull()
    .references(() => users.id),
  freelancerId: text("freelancer_id")
    .notNull()
    .references(() => users.id),
  status: bookingStatusEnum("status").notNull().default("pending"),
  contractDetails: jsonb("contract_details").notNull(),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payments
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookingRequests.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paymentMode: paymentModeEnum("payment_mode"), // cash, upi, or net_banking
  requestedBy: text("requested_by").references(() => users.id), // null if company initiates directly
  paidBy: text("paid_by").references(() => users.id), // company who paid
  paidAt: timestamp("paid_at"),
  awaitingConfirmationAt: timestamp("awaiting_confirmation_at"),
  requestNotes: text("request_notes"), // notes when requesting
  paymentNotes: text("payment_notes"), // notes when paying
  declineReason: text("decline_reason"), // reason for declining request
  disputeReason: text("dispute_reason"), // reason for dispute
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reports table
export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportType: reportTypeEnum("report_type").notNull(),
  // The ID of the reported item (job post ID, freelancer user ID, or company user ID)
  targetId: text("target_id").notNull(),
  // Who submitted the report
  reportedBy: text("reported_by")
    .notNull()
    .references(() => users.id),
  reason: text("reason").notNull(),
  description: text("description"),
  status: reportStatusEnum("status").notNull().default("pending"),
  // Admin who reviewed the report
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  companyProfile: one(companyProfiles, {
    fields: [users.id],
    references: [companyProfiles.userId],
  }),
  freelancerProfile: one(freelancerProfiles, {
    fields: [users.id],
    references: [freelancerProfiles.userId],
  }),
}));

export const companyProfilesRelations = relations(
  companyProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [companyProfiles.userId],
      references: [users.id],
    }),
  })
);

export const freelancerProfilesRelations = relations(
  freelancerProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [freelancerProfiles.userId],
      references: [users.id],
    }),
  })
);

export const jobPostsRelations = relations(jobPosts, ({ one, many }) => ({
  company: one(users, {
    fields: [jobPosts.companyId],
    references: [users.id],
  }),
  responses: many(jobResponses),
  bookingRequests: many(bookingRequests),
}));

export const jobResponsesRelations = relations(jobResponses, ({ one }) => ({
  job: one(jobPosts, {
    fields: [jobResponses.jobId],
    references: [jobPosts.id],
  }),
  freelancer: one(users, {
    fields: [jobResponses.freelancerId],
    references: [users.id],
  }),
}));

export const bookingRequestsRelations = relations(
  bookingRequests,
  ({ one, many }) => ({
    job: one(jobPosts, {
      fields: [bookingRequests.jobId],
      references: [jobPosts.id],
    }),
    company: one(users, {
      fields: [bookingRequests.companyId],
      references: [users.id],
    }),
    freelancer: one(users, {
      fields: [bookingRequests.freelancerId],
      references: [users.id],
    }),
    payments: many(payments),
  })
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookingRequests, {
    fields: [payments.bookingId],
    references: [bookingRequests.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reportedBy],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [reports.reviewedBy],
    references: [users.id],
  }),
}));
