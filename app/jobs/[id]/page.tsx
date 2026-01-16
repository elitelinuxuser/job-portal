import { Metadata } from "next";
import { getPublicJobById } from "@/lib/actions/public-jobs";
import { getUnreadResponsesCount } from "@/lib/actions/jobs";
import { getSelectedContractTerms } from "@/lib/constants/contract-terms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import {
  MapPin,
  Briefcase,
  ArrowLeft,
  Calendar,
  IndianRupee,
  Shield,
  CheckCircle2,
  Eye,
  MessageSquare,
  Building2,
  TrendingUp,
  Award,
  Lock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { getJobTypeLabel } from "@/lib/constants/job-types";
import { formatTimeRange } from "@/lib/utils/date-filters";
import { CompanyJobActions } from "@/components/company/company-job-actions";
import { LocationLink } from "@/components/shared/location-link";
import { ReportDialog } from "@/components/shared/report-dialog";
import { RespondToJobForm } from "@/components/freelancer/respond-to-job-form";
import { JobDetailsClient } from "@/components/freelancer/job-details-client";
import { CompanyNav } from "@/components/company/nav";
import { FreelancerNav } from "@/components/freelancer/nav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getPublicJobById(id);

  if (!data || !data.job) {
    return {
      title: "Job Not Found",
    };
  }

  const { job } = data;

  const description =
    job.description.length > 160
      ? `${job.description.substring(0, 160)}...`
      : job.description;

  return {
    title: `${job.title} | HFree`,
    description: description,
    openGraph: {
      title: job.title,
      description: description,
      type: "website",
      siteName: "HFree",
      locale: "en_IN",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: job.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: job.title,
      description: description,
      images: ["/twitter-image"],
      creator: "@hfree",
    },
  };
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPublicJobById(id);

  if (!data) {
    notFound();
  }

  const { job, userContext } = data;
  const {
    isOwner,
    userRole,
    hasResponded,
    response,
    isVerified,
    isAuthenticated,
  } = userContext;

  // Navigation Logic
  let Nav = null;
  if (userRole === "company") {
    const unreadCount = await getUnreadResponsesCount();
    Nav = <CompanyNav unreadResponsesCount={unreadCount} />;
  } else if (userRole === "freelancer") {
    Nav = <FreelancerNav />;
  } else {
    // Basic Public Nav
    Nav = (
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="HFree"
              width={40}
              height={40}
              className="rounded-lg"
              priority
              unoptimized
            />
            HFree
          </Link>
          <div className="flex gap-4">
            <Link href="/sign-in?redirect_url=/jobs/${job.id}">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  const responseCount = job.responses?.length || 0;

  return (
    <div
      className={
        userRole === "freelancer"
          ? "min-h-screen bg-linear-to-br from-slate-50 to-blue-50"
          : "min-h-screen bg-gray-50"
      }
    >
      {Nav}
      <div className="max-w-5xl mx-auto pb-20 pt-6">
        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header Card */}
          <Card className="rounded-xl border-t-4 border-t-indigo-600 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  {/* Breadcrumb / Back Link */}
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      href={
                        userRole === "company"
                          ? "/company"
                          : userRole === "freelancer"
                            ? "/freelancer"
                            : "/"
                      }
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2 h-8 text-gray-500 hover:text-gray-900"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                    </Link>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {job.title}
                  </h1>

                  {/* Verification Badge for Public/Freelancer view */}
                  {!isOwner && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span className="font-medium text-sm">
                        Verified Company
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Report Button for Freelancers/Public */}
                  {!isOwner && isAuthenticated && (
                    <ReportDialog
                      reportType="job_post"
                      targetId={job.id}
                      targetName={job.title}
                    />
                  )}
                  {/* Actions for Company */}
                  {isOwner && (
                    <CompanyJobActions jobId={job.id} isActive={job.isActive} />
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isOwner && (
                  <Badge
                    variant={job.isActive ? "default" : "secondary"}
                    className={`${job.isActive ? "bg-green-600" : "bg-gray-400"} text-white hover:bg-opacity-90`}
                  >
                    {job.isActive ? "Active" : "Inactive"}
                  </Badge>
                )}

                {job.jobTypes.map((jobType) => (
                  <Badge
                    key={jobType}
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    <Briefcase className="w-3 h-3 mr-1" />
                    {getJobTypeLabel(jobType)}
                  </Badge>
                ))}

                <Badge variant="outline" className="border-gray-300">
                  <Calendar className="w-3 h-3 mr-1" />
                  {job.dates.length} event(s)
                </Badge>

                <Badge className="bg-linear-to-r from-green-600 to-emerald-600 text-white border-0">
                  <IndianRupee className="w-3 h-3 mr-1" />
                  {parseFloat(job.budget || "0").toLocaleString("en-IN")}
                </Badge>

                {!isOwner && !hasResponded && job.isActive && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Open
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Description */}
              <div className="prose prose-sm sm:prose-base max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  About the Role
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>

              {/* Key Details Grid */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Project Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 text-blue-600">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-blue-900 mb-0.5">
                        Location
                      </p>
                      <LocationLink
                        location={job.locationFormatted || job.location}
                        latitude={job.locationLatitude}
                        longitude={job.locationLongitude}
                        placeId={job.locationPlaceId}
                        className="font-semibold text-gray-900 hover:underline block truncate"
                      />
                    </div>
                  </div>

                  {/* Responses (Owner) or Budget (Others) */}
                  {isOwner ? (
                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 text-purple-600">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-900 mb-0.5">
                          Total Responses
                        </p>
                        <p className="font-bold text-gray-900">
                          {responseCount} Applicant
                          {responseCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 text-green-600">
                        <IndianRupee className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-900 mb-0.5">
                          Budget
                        </p>
                        <p className="font-bold text-gray-900">{job.budget}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Schedule
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {job.dates.map((entry, idx) => {
                    const timeDisplay = formatTimeRange(
                      entry.startTime,
                      entry.endTime,
                    );
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {format(new Date(entry.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        {timeDisplay && (
                          <Badge
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {timeDisplay}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Terms */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Contract Terms
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {getSelectedContractTerms(
                    job.contractTerms as string[] | null,
                  ).map((term) => (
                    <div
                      key={term.id}
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200/60"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-gray-900">
                        {term.label}
                      </span>
                    </div>
                  ))}
                </div>
                {job.contractAdditionalDetails && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200/60 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Additional Details
                    </p>
                    <p className="text-sm text-gray-700">
                      {job.contractAdditionalDetails}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500 pt-4 border-t">
                Posted on {format(new Date(job.createdAt), "MMMM d, yyyy")}
              </div>
            </CardContent>
          </Card>

          {/* User Specific Actions */}

          {/* 1. Unauthenticated User */}
          {!isAuthenticated && (
            <Card className="rounded-xl border-t-4 border-t-indigo-500 shadow-sm bg-indigo-50/50">
              <CardContent className="p-8 text-center space-y-4">
                <Lock className="w-12 h-12 text-indigo-400 mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Sign in to Apply
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Create a freelancer account to apply for this job and browse
                    other opportunities.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 pt-2">
                  <Link href={`/sign-in?redirect_url=/jobs/${job.id}`}>
                    <Button size="lg" className="px-8">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button variant="outline" size="lg">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2. Freelancer - Apply Section (Desktop) */}
          {userRole === "freelancer" && !hasResponded && isVerified && (
            <Card className="hidden md:block rounded-xl border-t-4 border-t-blue-600 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Apply for this Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RespondToJobForm jobId={job.id} originalBudget={job.budget} />
              </CardContent>
            </Card>
          )}

          {/* 3. Freelancer - Unverified */}
          {userRole === "freelancer" && !hasResponded && !isVerified && (
            <Card className="hidden md:block rounded-xl border-t-4 border-t-amber-500 shadow-sm">
              <CardHeader className="bg-amber-50/50 border-b border-amber-100">
                <CardTitle className="text-xl flex items-center gap-2 text-amber-800">
                  <Shield className="w-5 h-5" />
                  Profile Under Review
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  Your profile is currently being reviewed. You&apos;ll be able
                  to apply for jobs once your profile is verified.
                </p>
              </CardContent>
            </Card>
          )}

          {/* 4. Freelancer - Already Applied (Desktop) */}
          {userRole === "freelancer" && hasResponded && response && (
            <Card className="hidden md:block rounded-xl border-t-4 border-t-green-600 shadow-sm">
              <CardHeader className="bg-green-50/50 border-b border-green-100">
                <div className="flex items-center gap-3 text-green-800">
                  <CheckCircle2 className="w-6 h-6" />
                  <div>
                    <CardTitle className="text-xl">Your Application</CardTitle>
                    <p className="text-sm text-green-700 mt-1">
                      Submitted on{" "}
                      {format(new Date(response.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">
                      Your Proposed Budget
                    </p>
                    <p className="font-bold text-green-800">
                      {response.proposedPrice || job.budget}
                    </p>
                  </div>
                </div>

                {response.message && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Your Message
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {response.message}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mobile Sticky Actions */}
        {userRole === "company" && isOwner && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg md:hidden z-40">
            <Link href={`/company/responses?job=${job.id}`} className="block">
              <Button className="w-full h-12 text-base font-semibold">
                <Eye className="w-5 h-5 mr-2" />
                View {responseCount} Response{responseCount !== 1 ? "s" : ""}
              </Button>
            </Link>
          </div>
        )}

        {userRole === "freelancer" && (
          <JobDetailsClient
            job={{
              id: job.id,
              title: job.title,
              budget: job.budget || "0",
            }}
            hasResponded={hasResponded}
            isVerified={isVerified}
            myResponse={
              response
                ? {
                    id: response.id,
                    proposedPrice: response.proposedPrice,
                    message: response.message,
                    createdAt: response.createdAt,
                  }
                : null
            }
          />
        )}

        {!isAuthenticated && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg md:hidden z-50">
            <Link
              href={`/sign-in?redirect_url=/jobs/${job.id}`}
              className="block"
            >
              <Button className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700">
                Sign In to Apply
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
