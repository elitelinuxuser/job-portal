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
export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "expired",
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

// Invites table
export const invites = pgTable("invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  role: userRoleEnum("role").notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  status: inviteStatusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at"),
  usedAt: timestamp("used_at"),
  usedBy: text("used_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

  // Contract details with checkboxes
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
  contractAdditionalDetails: text("contract_additional_details"),

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
  paidAt: timestamp("paid_at").notNull(),
  markedBy: text("marked_by")
    .notNull()
    .references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  companyProfile: one(companyProfiles, {
    fields: [users.id],
    references: [companyProfiles.userId],
  }),
  freelancerProfile: one(freelancerProfiles, {
    fields: [users.id],
    references: [freelancerProfiles.userId],
  }),
  invitesCreated: many(invites),
}));

export const companyProfilesRelations = relations(
  companyProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [companyProfiles.userId],
      references: [users.id],
    }),
    jobPosts: many(jobPosts),
  })
);

export const freelancerProfilesRelations = relations(
  freelancerProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [freelancerProfiles.userId],
      references: [users.id],
    }),
    responses: many(jobResponses),
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
