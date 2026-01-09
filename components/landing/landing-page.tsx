"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquareX,
  Bell,
  CreditCard,
  Sparkles,
  Building2,
  Users,
  Search,
  UserCheck,
  ClipboardCheck,
  CircleDollarSign,
  Briefcase,
  CalendarCheck,
  BadgeCheck,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UserType = "company" | "freelancer";

const companyProblems = [
  {
    icon: MessageSquareX,
    title: "No More WhatsApp Chaos",
    description: "Stop juggling multiple chats and groups to find professionals",
  },
  {
    icon: Bell,
    title: "No Spam Messages",
    description: "Only receive relevant responses from verified professionals",
  },
  {
    icon: Calendar,
    title: "No Manual Coordination",
    description: "Automated scheduling eliminates back-and-forth communication",
  },
  {
    icon: CheckCircle2,
    title: "No Confusion",
    description: "Clear contracts and transparent terms for every booking",
  },
];

const companySolutions = [
  {
    icon: Sparkles,
    title: "Easy Booking",
    description: "Book verified wedding professionals in just a few clicks",
  },
  {
    icon: FileText,
    title: "Clear Contracts",
    description: "Professional contracts with transparent terms enabled offline",
  },
  {
    icon: CalendarCheck,
    title: "Track Bookings",
    description: "Keep track of all your bookings in one centralized dashboard",
  },
  {
    icon: CreditCard,
    title: "Payments Log",
    description: "Complete payment history and records at your fingertips",
  },
  {
    icon: Bell,
    title: "WhatsApp Notifications",
    description: "Get instant notifications and reminders via WhatsApp",
  },
];

const companySteps = [
  {
    step: 1,
    title: "Post Requirement",
    description: "Share your wedding project details and requirements",
    icon: ClipboardCheck,
  },
  {
    step: 2,
    title: "View Responses",
    description: "Browse through applications from verified professionals",
    icon: Search,
  },
  {
    step: 3,
    title: "Find the Right Freelancer",
    description: "Select the perfect match for your project needs",
    icon: UserCheck,
  },
  {
    step: 4,
    title: "Confirm Booking",
    description: "Secure your booking with clear terms and contracts",
    icon: BadgeCheck,
  },
  {
    step: 5,
    title: "Track & Complete",
    description: "Monitor progress and mark project as completed",
    icon: CircleDollarSign,
  },
];

const freelancerSolutions = [
  {
    icon: Sparkles,
    title: "Easy Booking Process",
    description: "Streamlined workflow from application to confirmation",
  },
  {
    icon: Calendar,
    title: "Auto Calendar Update",
    description: "Your calendar syncs automatically with accepted bookings",
  },
  {
    icon: Bell,
    title: "WhatsApp Notifications",
    description: "Never miss an opportunity with instant alerts and reminders",
  },
  {
    icon: FileText,
    title: "Clear Contracts",
    description: "Professional contracts protecting both parties",
  },
  {
    icon: Receipt,
    title: "Payment Records",
    description: "Complete payment history and earnings tracking",
  },
];

const freelancerSteps = [
  {
    step: 1,
    title: "View Open Jobs",
    description: "Browse genuine opportunities from verified companies",
    icon: Briefcase,
  },
  {
    step: 2,
    title: "Apply Selectively",
    description: "Apply only to jobs that match your skills and schedule",
    icon: ClipboardCheck,
  },
  {
    step: 3,
    title: "Accept Booking",
    description: "Review details and accept bookings on your terms",
    icon: BadgeCheck,
  },
  {
    step: 4,
    title: "Calendar Auto-Update",
    description: "Your availability updates automatically",
    icon: CalendarCheck,
  },
  {
    step: 5,
    title: "Get Paid",
    description: "Receive secure payments for completed work",
    icon: CircleDollarSign,
  },
];

const STORAGE_KEY = "hfree_user_type";

export function LandingPage() {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const isCompany = userType === "company";

  // Check localStorage after hydration to avoid mismatch
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "company" || saved === "freelancer") {
      setUserType(saved);
      setShowOverlay(false);
    }
    setIsHydrated(true);
  }, []);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setShowOverlay(false);
    localStorage.setItem(STORAGE_KEY, type);
  };

  // Prevent flash during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="size-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* User Type Selection Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-amber-300 mb-6 backdrop-blur-sm">
              <Sparkles className="size-4 animate-pulse" />
              Built for the Wedding Industry
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">HFree</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl mx-auto">
              The platform connecting wedding companies with verified professionals. Tell us who you are to get started.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Company Option */}
              <button
                onClick={() => handleUserTypeSelect("company")}
                className="group relative bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-amber-400/50 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 rounded-2xl transition-all duration-300" />
                <div className="relative z-10">
                  <div className="size-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Building2 className="size-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">I&apos;m a Company</h3>
                  <p className="text-slate-400 text-sm">
                    Hire verified wedding photographers, videographers & specialists
                  </p>
                </div>
              </button>

              {/* Freelancer Option */}
              <button
                onClick={() => handleUserTypeSelect("freelancer")}
                className="group relative bg-white/5 hover:bg-white/10 border-2 border-white/20 hover:border-rose-400/50 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-rose-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/10 group-hover:to-pink-500/10 rounded-2xl transition-all duration-300" />
                <div className="relative z-10">
                  <div className="size-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <Users className="size-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">I&apos;m a Freelancer</h3>
                  <p className="text-slate-400 text-sm">
                    Find genuine work with clear terms & secure payments
                  </p>
                </div>
              </button>
            </div>

            <p className="text-slate-500 text-sm mt-8">
              🎉 First 100 users get <span className="text-amber-400 font-semibold">1 Year FREE</span>
            </p>
          </div>
        </div>
      )}
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm md:text-base font-medium">
          <Sparkles className="size-4 md:size-5 animate-pulse" />
          <span>
            🎉 <strong>Limited Offer:</strong> First 100 users get{" "}
            <span className="underline underline-offset-2 font-bold">1 Year FREE</span> on signup!
          </span>
          <Sparkles className="size-4 md:size-5 animate-pulse" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="HFree" width={36} height={36} className="rounded-lg" />
              <span className="font-bold text-xl text-slate-800">HFree</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild className="bg-slate-800 hover:bg-slate-700">
                <Link href="/sign-up">
                  Get Started <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* User Type Toggle - First Interactive Element */}
            <div className="inline-flex items-center bg-slate-100 rounded-full p-1.5 mb-8 shadow-lg shadow-slate-200/50">
              <button
                onClick={() => setUserType("company")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                  isCompany
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Building2 className="size-4" />
                I&apos;m a Company
              </button>
              <button
                onClick={() => setUserType("freelancer")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                  !isCompany
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Users className="size-4" />
                I&apos;m a Freelancer
              </button>
            </div>

            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 text-sm text-slate-600 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Built specifically for the wedding industry
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
              {isCompany ? (
                <>
                  Hire Verified{" "}
                  <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
                    Wedding Professionals
                  </span>{" "}
                  with Ease
                </>
              ) : (
                <>
                  Find{" "}
                  <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
                    Genuine Work
                  </span>{" "}
                  Without the Hustle
                </>
              )}
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              {isCompany
                ? "Fast, efficient, and professional. Connect with verified photographers, videographers, and wedding specialists in minutes."
                : "Stop chasing companies. Let verified opportunities come to you with clear terms, secure payments, and professional contracts."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-base px-8 py-6"
                asChild
              >
                <Link href="/sign-up">
                  {isCompany ? "Start Hiring Today" : "Find Work Now"}
                  <ArrowRight className="size-5 ml-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-6"
                asChild
              >
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section (Company Only) */}
      {isCompany && (
        <section className="py-16 md:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Say Goodbye to These Problems
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Traditional hiring methods are broken. We&apos;ve built something better.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {companyProblems.map((problem, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-rose-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="size-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
                    <problem.icon className="size-6 text-rose-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{problem.title}</h3>
                  <p className="text-sm text-slate-600">{problem.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions/Features Section */}
      <section className={cn("py-16 md:py-24", isCompany ? "bg-white" : "bg-slate-50")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {isCompany ? "Everything You Need to Hire Right" : "Built for Your Success"}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {isCompany
                ? "Powerful features designed to make hiring wedding professionals effortless"
                : "Tools and features that help you find work and get paid without the usual hassle"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isCompany ? companySolutions : freelancerSolutions).map((solution, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-amber-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="size-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <solution.icon className="size-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">{solution.title}</h3>
                <p className="text-slate-600">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              {isCompany
                ? "From posting requirements to project completion in 5 simple steps"
                : "From browsing jobs to getting paid - simple and transparent"}
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 -translate-y-1/2" />

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
              {(isCompany ? companySteps : freelancerSteps).map((step, index) => (
                <div key={index} className="relative text-center">
                  <div className="relative z-10 mx-auto size-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                    <step.icon className="size-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 size-7 rounded-full bg-white text-slate-900 font-bold text-sm flex items-center justify-center shadow-md z-20">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Video Tutorial */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-white mb-2">Watch How It Works</h3>
              <p className="text-slate-400">See the platform in action</p>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
              <iframe
                src="https://www.youtube.com/embed/videoseries?list=PLlErPG1lqtO2spppW7x5JkQn1frGBaliV"
                title="HFree Platform Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-rose-500/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-amber-300 mb-6 backdrop-blur-sm">
                <Sparkles className="size-4" />
                Limited Time Offer
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Wedding Business?
              </h2>

              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Join the first 100 users and get{" "}
                <span className="text-amber-400 font-semibold">1 year completely FREE</span>. No
                credit card required.
              </p>

              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-lg px-10 py-6 shadow-xl shadow-amber-500/25"
                asChild
              >
                <Link href="/sign-up">
                  Claim Your Free Year
                  <ArrowRight className="size-5 ml-2" />
                </Link>
              </Button>

              <p className="text-sm text-slate-400 mt-4">
                🔒 Secure signup • No spam • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="HFree" width={32} height={32} className="rounded-lg" />
              <span className="font-bold text-lg text-slate-800">HFree</span>
            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} HFree. Built for the wedding industry.
            </p>

            <div className="flex items-center gap-6 text-sm text-slate-600">
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Terms
              </Link>
              {/* <Link href="#" className="hover:text-slate-900 transition-colors">
                Contact
              </Link> */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
