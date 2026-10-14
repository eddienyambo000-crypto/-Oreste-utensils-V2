import { NextResponse } from "next/server";
import { getGoogleReviewUrl } from "@/lib/data";
import { reviewDestination } from "@/lib/reviews";

/**
 * The address printed on the review QR card. Forwards to the Google review
 * link saved in the admin (or to the shop's Google Maps search until one is
 * saved). A temporary redirect, so changing the link never strands a card.
 */
export async function GET() {
  const destination = reviewDestination(await getGoogleReviewUrl());
  return NextResponse.redirect(destination, {
    status: 302,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
