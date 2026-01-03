'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/role-selection" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign Up
        </Link>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            HFREE – Terms & Conditions
          </h1>
          <p className="text-gray-500 mb-8">Last updated: 30/12/2025</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              By accessing or using <strong>HFree</strong> (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), you agree to be bound by these Terms & Conditions (&ldquo;Terms&rdquo;). If you do not agree, please do not use the Platform.
            </p>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. What HFree Is (and Is Not)</h2>
              <p className="text-gray-700 mb-4">HFree is a <strong>technology platform</strong> that enables:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Wedding companies (&ldquo;Companies&rdquo;) to post requirements</li>
                <li>Wedding freelancers (&ldquo;Freelancers&rdquo;) to discover and respond to those requirements</li>
              </ul>
              <p className="text-gray-700 mb-2"><strong>HFree does NOT:</strong></p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Employ freelancers</li>
                <li>Act as an agency, employer, contractor, or broker</li>
                <li>Guarantee work, payments, availability, or outcomes</li>
                <li>Supervise, manage, or control services delivered by freelancers</li>
                <li>Act as a party to any agreement between Companies and Freelancers</li>
              </ul>
              <p className="text-gray-700 mt-4">All engagements are <strong>strictly between the Company and the Freelancer</strong>.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. User Eligibility</h2>
              <p className="text-gray-700 mb-4">By using HFree, you confirm that:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You are at least 18 years old</li>
                <li>You have the legal authority to enter into agreements</li>
                <li>All information provided by you is accurate and truthful</li>
              </ul>
              <p className="text-gray-700 mt-4">HFree reserves the right to suspend or terminate accounts that provide false, misleading, or incomplete information.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Account Registration & Invite-Only Access</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access to HFree is <strong>invite-only</strong></li>
                <li>Each user is responsible for maintaining the confidentiality of their account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
              </ul>
              <p className="text-gray-700 mt-4">HFree is not responsible for unauthorized access due to user negligence.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Role of HFree in Bookings</h2>
              <p className="text-gray-700 mb-4">HFree only facilitates:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Discovery of opportunities</li>
                <li>Communication of interest</li>
                <li>Booking confirmations</li>
                <li>Contract documentation (if enabled)</li>
              </ul>
              <p className="text-gray-700 mb-2"><strong>HFree does not:</strong></p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Verify the quality, safety, legality, or suitability of services</li>
                <li>Guarantee attendance, performance, or completion of work</li>
                <li>Enforce payments or resolve disputes unless explicitly stated</li>
              </ul>
              <p className="text-gray-700 mt-4">Any booking, contract, or agreement is <strong>solely between the Company and the Freelancer</strong>.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Payments & Financial Responsibility</h2>
              <p className="text-gray-700 mb-4">Unless explicitly stated otherwise:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Payments are agreed upon directly between Companies and Freelancers</li>
                <li>HFree is not responsible for:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Payment delays</li>
                    <li>Non-payment</li>
                    <li>Refunds</li>
                    <li>Chargebacks</li>
                    <li>Disputes related to money</li>
                  </ul>
                </li>
              </ul>
              <p className="text-gray-700">If HFree introduces payment facilitation or escrow in the future, additional terms will apply.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Contracts Between Users</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Contracts generated or enabled through HFree are <strong>templates or facilitators only</strong></li>
                <li>HFree is <strong>not a legal advisor</strong></li>
                <li>Users are solely responsible for reviewing, agreeing to, and complying with contract terms</li>
              </ul>
              <p className="text-gray-700 mb-2">HFree is not liable for:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Breach of contract</li>
                <li>Misrepresentation</li>
                <li>Contract disputes</li>
                <li>Legal consequences arising from agreements between users</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Calendar, Notifications & Automation</h2>
              <p className="text-gray-700 mb-4">HFree may provide:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>WhatsApp notifications</li>
                <li>Calendar updates</li>
                <li>Automated reminders</li>
              </ul>
              <p className="text-gray-700 mb-2">These features are <strong>assistive only</strong>. HFree is not responsible for:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Missed events</li>
                <li>Scheduling conflicts</li>
                <li>Incorrect dates</li>
                <li>Failed notifications</li>
                <li>Third-party service failures (WhatsApp, Google Calendar, etc.)</li>
              </ul>
              <p className="text-gray-700 mt-4">Users must independently verify all booking details.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. Freelancer Verification & Aadhaar Uploads</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Any verification or document upload is for <strong>platform trust only</strong></li>
                <li>HFree does not guarantee identity authenticity or professional competence</li>
                <li>Companies must independently evaluate freelancers before booking</li>
              </ul>
              <p className="text-gray-700 mb-2">HFree is not liable for:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Fraud</li>
                <li>Identity misuse</li>
                <li>Service quality</li>
                <li>Professional misconduct</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">9. User Conduct</h2>
              <p className="text-gray-700 mb-4">Users agree NOT to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide false information</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Circumvent platform processes</li>
                <li>Use HFree for illegal or unethical activities</li>
              </ul>
              <p className="text-gray-700 mt-4">HFree reserves the right to suspend or permanently ban accounts at its sole discretion.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">10. Limitation of Liability (VERY IMPORTANT)</h2>
              <p className="text-gray-700 mb-4">To the <strong>maximum extent permitted by law</strong>:</p>
              <p className="text-gray-700 mb-2">HFree shall <strong>not be liable</strong> for:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Any direct, indirect, incidental, special, or consequential damages</li>
                <li>Loss of income, business, reputation, or data</li>
                <li>Injury, death, property damage, or financial loss</li>
                <li>Disputes between users</li>
                <li>Event failures, cancellations, or no-shows</li>
              </ul>
              <p className="text-gray-700 mt-4 font-semibold">Use of HFree is entirely at your own risk.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-700">You agree to indemnify and hold harmless HFree, its founders, employees, and partners from any claims, losses, damages, or legal expenses arising from:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>Your use of the platform</li>
                <li>Your interactions with other users</li>
                <li>Your breach of these Terms</li>
                <li>Any agreement entered into through HFree</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">12. Platform Availability</h2>
              <p className="text-gray-700 mb-4">HFree is provided on an <strong>&ldquo;as-is&rdquo; and &ldquo;as-available&rdquo;</strong> basis.</p>
              <p className="text-gray-700 mb-2">We do not guarantee:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Uptime</li>
                <li>Error-free operation</li>
                <li>Feature availability</li>
              </ul>
              <p className="text-gray-700 mt-4">We may modify, suspend, or discontinue the platform at any time without notice.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">13. Intellectual Property</h2>
              <p className="text-gray-700">All platform content, branding, and technology belong to HFree. Users may not copy, resell, or misuse platform assets without permission.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">14. Termination</h2>
              <p className="text-gray-700 mb-4">HFree reserves the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Suspend or terminate accounts without notice</li>
                <li>Remove content or bookings that violate these Terms</li>
              </ul>
              <p className="text-gray-700 mt-4">Users may stop using the platform at any time.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">15. Governing Law & Jurisdiction</h2>
              <p className="text-gray-700">These Terms are governed by the laws of <strong>India</strong>. All disputes shall be subject to the exclusive jurisdiction of courts in <strong>Bengaluru, India</strong>.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">16. Changes to Terms</h2>
              <p className="text-gray-700">HFree may update these Terms at any time. Continued use of the platform constitutes acceptance of the updated Terms.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">17. Contact</h2>
              <p className="text-gray-700">For questions or concerns: Email - <a href="mailto:hirefreeapp@gmail.com" className="text-blue-600 hover:underline">hirefreeapp@gmail.com</a></p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
