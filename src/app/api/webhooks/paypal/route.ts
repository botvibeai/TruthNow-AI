import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    console.log('Received PayPal Webhook:', event.event_type);

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        // Handle subscription activation
        // e.g., Update Firebase Firestore user record to active
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        // Handle subscription cancellation
        break;
      case 'PAYMENT.SALE.COMPLETED':
        // Handle successful payment
        break;
      default:
        console.log(`Unhandled event type ${event.event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
