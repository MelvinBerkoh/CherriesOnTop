"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner-session";
import {
  quoteStatuses,
  type QuoteStatusState,
} from "@/lib/quote-status";

const updateSchema = z.object({
  id: z.string().min(1).max(128),
  status: z.enum(quoteStatuses),
  updatedAt: z.iso.datetime(),
});

export async function updateQuoteStatus(
  _previousState: QuoteStatusState,
  formData: FormData,
): Promise<QuoteStatusState> {
  await requireOwner();

  const result = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    updatedAt: formData.get("updatedAt"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Choose a valid status and try again.",
    };
  }

  const updatedAt = new Date();

  try {
    const saved = await db.quoteRequest.updateMany({
      where: {
        id: result.data.id,
        updatedAt: new Date(result.data.updatedAt),
      },
      data: {
        status: result.data.status,
        updatedAt,
      },
    });

    if (saved.count !== 1) {
      return {
        status: "error",
        message:
          "This request changed or is no longer available. Reload the page before saving again.",
      };
    }
  } catch (error) {
    console.error(
      "Quote status save failed:",
      error instanceof Error ? error.name : "UnknownError",
    );

    return {
      status: "error",
      message: "Could not save the status. Please try again.",
    };
  }

  revalidatePath("/owner");
  revalidatePath(`/owner/quotes/${result.data.id}`);

  return {
    status: "success",
    message: "Status saved.",
    updatedAt: updatedAt.toISOString(),
  };
}