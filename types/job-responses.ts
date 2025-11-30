import type { JobType } from "@/lib/constants/job-types";

// Freelancer Profile
export interface FreelancerProfile {
  id: string;
  userId: string;
  name: string;
  location: string;
  photoUrl: string | null;
  whatsappNumber: string;
  verificationStatus: "pending" | "verified" | "rejected";
  equipmentList: string[] | null;
  portfolioLinks: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

// User (Freelancer)
export interface FreelancerUser {
  id: string;
  email: string;
  role: string;
  freelancerProfile: FreelancerProfile | null;
}

// Job Post
export interface JobPost {
  id: string;
  companyId: string;
  title: string;
  description: string;
  dates: Array<{ date: string; startTime?: string; endTime?: string }>;
  location: string;
  locationFormatted: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  locationLatitude: string | null;
  locationLongitude: string | null;
  locationPlaceId: string | null;
  budget: string | null;
  jobTypes: JobType[];
  contractContentPosting: boolean;
  contractAdvancePayment: boolean;
  contractPaymentAfterShot: boolean;
  contractContentOwnership: boolean;
  contractSdCard: boolean;
  contractAdditionalDetails: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: {
    companyProfile?: {
      companyName?: string;
    };
  };
}

// Booking Request
export interface BookingRequest {
  id: string;
  jobId: string;
  companyId: string;
  freelancerId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

// Job Response
export interface JobResponse {
  id: string;
  jobId: string;
  freelancerId: string;
  status: "interested" | "not_interested";
  message: string | null;
  proposedPrice: string | null;
  createdAt: Date;
  viewedAt: Date | null;
}

// Job Response with relations
export interface JobResponseWithRelations extends JobResponse {
  freelancer: FreelancerUser;
  job: JobPost;
  bookingRequest?: BookingRequest | null;
}

// Company Job with responses
export interface CompanyJobWithResponses extends JobPost {
  responses: JobResponseWithRelations[];
}
