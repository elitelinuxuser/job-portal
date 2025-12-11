import { NextRequest, NextResponse } from "next/server";
import {
  WebhookRequestAdapter,
  WasenderWebhookEventType,
  WasenderAPIError,
} from "wasenderapi";
import { wasender } from "@/lib/wasender";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.WASENDER_WEBHOOK_SECRET;

  if (!webhookSecret || !wasender) {
    console.error("Wasender webhook secret not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  try {
    // Get raw body for signature verification
    const rawBody = await req.text();

    // Create adapter for the wasender SDK
    const adapter: WebhookRequestAdapter = {
      getHeader: (name: string) => req.headers.get(name) || "",
      getRawBody: () => rawBody,
    };

    // Verify and parse the webhook event
    const webhookEvent = await wasender.handleWebhookEvent(adapter);

    console.log("Received Wasender webhook event:", webhookEvent.event);

    // Handle different event types
    switch (webhookEvent.event) {
      case WasenderWebhookEventType.MessagesReceived:
        // Handle incoming message
        console.log("Incoming message received:", webhookEvent.data);
        // You can add custom logic here to handle incoming messages
        // For example, auto-replies, logging, or forwarding to support
        break;

      case WasenderWebhookEventType.MessagesUpsert:
        // Handle message upsert (both incoming and outgoing)
        console.log("Message upsert event:", webhookEvent.data);
        break;

      case WasenderWebhookEventType.MessageSent:
        // Handle sent message confirmation
        console.log("Message sent confirmation:", webhookEvent.data);
        break;

      case WasenderWebhookEventType.MessagesUpdate:
        // Handle message status update (delivered, read, etc.)
        console.log("Message status update:", webhookEvent.data);
        break;

      case WasenderWebhookEventType.SessionStatus:
        // Handle session status changes
        console.log("Session status update:", webhookEvent.data);
        break;

      case WasenderWebhookEventType.MessagesPersonalReceived:
        // Handle personal message received
        console.log("Personal message received:", webhookEvent.data);
        break;

      case WasenderWebhookEventType.MessagesGroupReceived:
        // Handle group message received
        console.log("Group message received:", webhookEvent.data);
        break;

      default:
        console.log("Unhandled webhook event:", webhookEvent.event);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof WasenderAPIError) {
      console.error(
        "Wasender webhook error:",
        error.apiMessage,
        "Status:",
        error.statusCode
      );
      return NextResponse.json(
        { error: error.apiMessage },
        { status: error.statusCode || 400 }
      );
    }

    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification (if needed)
export async function GET(req: NextRequest) {
  // Some webhook providers send a GET request to verify the endpoint
  const searchParams = req.nextUrl.searchParams;
  const challenge = searchParams.get("challenge");

  if (challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json(
    { message: "Wasender webhook endpoint active" },
    { status: 200 }
  );
}
