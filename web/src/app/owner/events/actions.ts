"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner-session";
import {
  eventFields,
  type EventActionState,
} from "@/lib/event-form";
import { eventSchema } from "@/lib/event-validation";

function readEventForm(formData: FormData) {
  return Object.fromEntries(
    eventFields.map((name) => {
      const value = formData.get(name);
      return [
        name,
        typeof value === "string" ? value : "",
      ];
    }),
  );
}

export async function createPublicEvent(
  _previousState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  await requireOwner();

  const result = eventSchema.safeParse(
    readEventForm(formData),
  );

  if (!result.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }

  try {
    await db.publicEvent.create({
      data: result.data,
    });
  } catch (error) {
    console.error(
      "Event save failed:",
      error instanceof Error ? error.name : "UnknownError",
    );

    return {
      status: "error",
      message: "Could not save the event. Please try again.",
    };
  }

  revalidatePath("/owner/events");
  revalidatePath("/events");
  redirect("/owner/events");
}

export async function updatePublicEvent(
  _previousState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  await requireOwner();

  const identity = z
    .object({
      id: z.string().min(1).max(128),
      updatedAt: z.iso.datetime(),
    })
    .safeParse({
      id: formData.get("id"),
      updatedAt: formData.get("updatedAt"),
    });

  if (!identity.success) {
    return {
      status: "error",
      message: "Reload this event and try again.",
    };
  }

  const result = eventSchema.safeParse(
    readEventForm(formData),
  );

  if (!result.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: z.flattenError(result.error).fieldErrors,
    };
  }

  try {
    const saved = await db.publicEvent.updateMany({
      where: {
        id: identity.data.id,
        updatedAt: new Date(identity.data.updatedAt),
      },
      data: result.data,
    });

    if (saved.count !== 1) {
      return {
        status: "error",
        message:
          "This event changed or is no longer available. Reload before saving again.",
      };
    }
  } catch (error) {
    console.error(
      "Event update failed:",
      error instanceof Error ? error.name : "UnknownError",
    );

    return {
      status: "error",
      message: "Could not save the event. Please try again.",
    };
  }

  revalidatePath("/owner/events");
  revalidatePath(`/owner/events/${identity.data.id}/edit`);
  revalidatePath("/events");
  redirect("/owner/events");
}