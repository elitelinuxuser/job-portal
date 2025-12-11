import { createWasender, TextOnlyMessage, RetryConfig } from "wasenderapi";

// Initialize Wasender SDK
const apiKey = process.env.WASENDER_API_KEY;
const personalAccessToken = process.env.WASENDER_PERSONAL_ACCESS_TOKEN;
const webhookSecret = process.env.WASENDER_WEBHOOK_SECRET;

const retryOptions: RetryConfig = {
  enabled: true,
  maxRetries: 3,
};

// Create wasender instance - will be undefined if no API key is provided
const wasender =
  apiKey || personalAccessToken
    ? createWasender(
        apiKey,
        personalAccessToken,
        undefined, // baseUrl
        undefined, // customFetch
        retryOptions,
        webhookSecret
      )
    : null;

// Helper to format phone number to WhatsApp format
function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // If starts with +, remove it (wasender expects without +)
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // If it's an Indian number without country code, add 91
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }

  return cleaned;
}

// Send a text message
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!wasender) {
    console.warn("Wasender not configured - skipping WhatsApp message");
    return { success: false, error: "Wasender not configured" };
  }

  try {
    const payload: TextOnlyMessage = {
      messageType: "text",
      to: formatPhoneNumber(to),
      text: message,
    };

    const result = await wasender.send(payload);
    console.log("WhatsApp message sent:", result.response);
    return { success: true };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Message templates for different platform activities
export const messageTemplates = {
  // Job-related notifications
  newJobPosted: (jobTitle: string, location: string, companyName: string) =>
    `🎉 New Job Alert!\n\n*${jobTitle}*\n📍 ${location}\n🏢 ${companyName}\n\nLog in to the platform to view details and express your interest.`,

  freelancerInterested: (
    freelancerName: string,
    jobTitle: string,
    proposedPrice?: string
  ) =>
    `👋 New Interest!\n\n*${freelancerName}* is interested in your job "*${jobTitle}*"${
      proposedPrice ? `\n💰 Proposed: ₹${proposedPrice}` : ""
    }\n\nLog in to view their profile and send a booking request.`,

  // Booking notifications
  bookingRequestSent: (companyName: string, jobTitle: string, dates: string) =>
    `📋 Booking Request!\n\n*${companyName}* wants to book you for "*${jobTitle}*"\n📅 ${dates}\n\nLog in to accept or decline this booking.`,

  bookingAccepted: (freelancerName: string, jobTitle: string) =>
    `✅ Booking Confirmed!\n\n*${freelancerName}* has accepted your booking for "*${jobTitle}*"\n\nYou can now coordinate further details.`,

  bookingRejected: (
    freelancerName: string,
    jobTitle: string,
    reason?: string
  ) =>
    `❌ Booking Declined\n\n*${freelancerName}* has declined your booking for "*${jobTitle}*"${
      reason ? `\n\nReason: ${reason}` : ""
    }\n\nYou can send requests to other interested freelancers.`,

  // Payment notifications
  paymentRequested: (
    freelancerName: string,
    amount: string,
    jobTitle: string
  ) =>
    `💰 Payment Request\n\n*${freelancerName}* has requested a payment of *₹${amount}* for "*${jobTitle}*"\n\nLog in to process this payment.`,

  paymentMarkedPaid: (companyName: string, amount: string, jobTitle: string) =>
    `💳 Payment Marked!\n\n*${companyName}* has marked a payment of *₹${amount}* as paid for "*${jobTitle}*"\n\nPlease confirm receipt of this payment.`,

  paymentConfirmed: (amount: string, jobTitle: string) =>
    `✅ Payment Confirmed!\n\nYour payment of *₹${amount}* for "*${jobTitle}*" has been confirmed.\n\nThank you!`,

  paymentDeclined: (amount: string, jobTitle: string, reason?: string) =>
    `❌ Payment Declined\n\nThe payment of *₹${amount}* for "*${jobTitle}*" was declined.${
      reason ? `\n\nReason: ${reason}` : ""
    }\n\nPlease contact the freelancer for clarification.`,

  // Verification notifications
  profileVerified: (name: string) =>
    `✅ Profile Verified!\n\nCongratulations *${name}*! Your profile has been verified.\n\nYou now have full access to the platform.`,

  profileRejected: (name: string, reason?: string) =>
    `❌ Verification Failed\n\nHi *${name}*, your profile verification was unsuccessful.${
      reason ? `\n\nReason: ${reason}` : ""
    }\n\nPlease update your profile and try again.`,

  // Job completion
  jobCompleted: (jobTitle: string, companyName: string) =>
    `🎊 Job Completed!\n\n"*${jobTitle}*" with *${companyName}* has been marked as complete.\n\nThank you for your great work!`,
};

// Notification sender functions for different events
export async function notifyFreelancerNewJob(
  freelancerPhone: string,
  jobTitle: string,
  location: string,
  companyName: string
) {
  return sendWhatsAppMessage(
    freelancerPhone,
    messageTemplates.newJobPosted(jobTitle, location, companyName)
  );
}

export async function notifyCompanyFreelancerInterested(
  companyPhone: string,
  freelancerName: string,
  jobTitle: string,
  proposedPrice?: string
) {
  return sendWhatsAppMessage(
    companyPhone,
    messageTemplates.freelancerInterested(
      freelancerName,
      jobTitle,
      proposedPrice
    )
  );
}

export async function notifyFreelancerBookingRequest(
  freelancerPhone: string,
  companyName: string,
  jobTitle: string,
  dates: string
) {
  return sendWhatsAppMessage(
    freelancerPhone,
    messageTemplates.bookingRequestSent(companyName, jobTitle, dates)
  );
}

export async function notifyCompanyBookingAccepted(
  companyPhone: string,
  freelancerName: string,
  jobTitle: string
) {
  return sendWhatsAppMessage(
    companyPhone,
    messageTemplates.bookingAccepted(freelancerName, jobTitle)
  );
}

export async function notifyCompanyBookingRejected(
  companyPhone: string,
  freelancerName: string,
  jobTitle: string,
  reason?: string
) {
  return sendWhatsAppMessage(
    companyPhone,
    messageTemplates.bookingRejected(freelancerName, jobTitle, reason)
  );
}

export async function notifyCompanyPaymentRequested(
  companyPhone: string,
  freelancerName: string,
  amount: string,
  jobTitle: string
) {
  return sendWhatsAppMessage(
    companyPhone,
    messageTemplates.paymentRequested(freelancerName, amount, jobTitle)
  );
}

export async function notifyFreelancerPaymentMarked(
  freelancerPhone: string,
  companyName: string,
  amount: string,
  jobTitle: string
) {
  return sendWhatsAppMessage(
    freelancerPhone,
    messageTemplates.paymentMarkedPaid(companyName, amount, jobTitle)
  );
}

export async function notifyCompanyPaymentConfirmed(
  companyPhone: string,
  amount: string,
  jobTitle: string
) {
  return sendWhatsAppMessage(
    companyPhone,
    messageTemplates.paymentConfirmed(amount, jobTitle)
  );
}

export async function notifyFreelancerPaymentDeclined(
  freelancerPhone: string,
  amount: string,
  jobTitle: string,
  reason?: string
) {
  return sendWhatsAppMessage(
    freelancerPhone,
    messageTemplates.paymentDeclined(amount, jobTitle, reason)
  );
}

export async function notifyProfileVerified(phone: string, name: string) {
  return sendWhatsAppMessage(phone, messageTemplates.profileVerified(name));
}

export async function notifyProfileRejected(
  phone: string,
  name: string,
  reason?: string
) {
  return sendWhatsAppMessage(
    phone,
    messageTemplates.profileRejected(name, reason)
  );
}

export async function notifyJobCompleted(
  freelancerPhone: string,
  jobTitle: string,
  companyName: string
) {
  return sendWhatsAppMessage(
    freelancerPhone,
    messageTemplates.jobCompleted(jobTitle, companyName)
  );
}

// Export the wasender instance for webhook handling
export { wasender };
