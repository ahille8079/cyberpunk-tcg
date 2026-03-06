import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { amount } = await request.json();

  const cents = Math.round(Number(amount) * 100);
  if (!cents || cents < 100) {
    return NextResponse.json({ error: "Minimum tip is $1" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Support RipperDeck",
            description:
              "A tip to help cover hosting, infrastructure, and development costs for RipperDeck.",
          },
          unit_amount: cents,
        },
        quantity: 1,
      },
    ],
    success_url: `${request.headers.get("origin")}/?tip=thanks`,
    cancel_url: `${request.headers.get("origin")}/?tip=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
