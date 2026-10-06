"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import {
  cateringPackages,
  getPackageEstimate,
} from "@/lib/packages";
import {
  createQuoteSchema,
  quoteFields,
  type QuoteActionState,
} from "@/lib/quote-request";

export async function submitQuoteRequest(
  _previousState: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  function text(name: string) {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  }

  if (text("website")) {
    return {
      status: "error",
      message: "We could not submit this request. Please try again.",
    };
  }

  const result = createQuoteSchema().safeParse(
    Object.fromEntries(
      quoteFields.map((name) => [name, text(name)]),
    ),
  );

  if (!result.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }

  const data = result.data;
  const selectedPackage = cateringPackages.find(
    (item) => item.id === data.packageId,
  );

  try {
    const request = await db.quoteRequest.create({
      data: {
        ...data,
        eventDate: new Date(`${data.eventDate}T00:00:00.000Z`),
        packageName: selectedPackage?.name,
        estimatedTotalCents: selectedPackage
          ? getPackageEstimate(selectedPackage, data.guestCount)
          : null,
      },
      select: { id: true },
    });

    return {
      status: "success",
      message:
        "Your request has been saved. We will get in touch to discuss your event.",
      reference: request.id,
    };
  } catch (error) {
    console.error(
      "Quote request save failed:",
      error instanceof Error ? error.name : "UnknownError",
    );

    return {
      status: "error",
      message:
        "We could not save your request. Please try again, or email us using the link below.",
    };
  }
}