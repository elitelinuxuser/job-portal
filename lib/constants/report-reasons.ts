// Report reasons for different types
export const REPORT_REASONS = {
  job_post: [
    "Spam or misleading",
    "Inappropriate content",
    "Fraudulent job posting",
    "Incorrect information",
    "Harassment or abuse",
    "Other",
  ],
  freelancer: [
    "Fake profile",
    "Inappropriate behavior",
    "Fraudulent activity",
    "Spam or misleading",
    "Harassment or abuse",
    "Other",
  ],
  company: [
    "Fake company",
    "Inappropriate behavior",
    "Fraudulent activity",
    "Non-payment issues",
    "Harassment or abuse",
    "Other",
  ],
};

export type ReportType = "job_post" | "freelancer" | "company";
